import { LauncherBase, MoveType } from "live-cat";
import type{ Options } from "live-cat/types/launcher-base";
import { Client } from "./client";
import {
  BaseOptionsType,
  DesignInfo,
  KeyboardType,
  LandscapeType,
  PrivateStartInfo,
  StartType,
  StatusPrivateInterface,
  StatusResponsePrivate,
} from "./client/interface";
import { LoadingComponent } from "./loading/loading";
import type { OnChange } from "./loading/loading";

import {
  handleNormalizeBitrate,
  isAndroid,
  isIOS,
  isTouch,
  isWeiXin,
  sleep,
  takeScreenshotUrl,
} from "./utils";
import { autoLoadingVideoHandler, autoLoadingVideo } from "./store";
import { ErrorStateMap } from "./utils/error-profile";
import type { Phase } from "live-cat/types/launcher-base";
import type { ErrorState } from "live-cat/types/launcher-base";
import { StatusMap } from "./utils/status-code-private";
import type { Options as loadingOptions } from "./loading/loading";
import { AutoRetry, StorageType } from "./utils/auto-retry";
import { PrivateReport } from "./utils/private-report";
import { FastTouchSideEffect } from "./utils/helper";
import { LiveStart, LiveStop, LiveURL } from "./utils/extend-adapter";
import { KeepActiveHelper } from "./utils/keek-active-helper";
import DisplayModeModal from "./components/display-mode-modal/display-mode-modal.svelte";
import { displayModeIcon, displayPointerIcon } from "./utils/extend-static-assets";
import { VirtualKeyboardComponent } from "./components/virtual-keyboard/virtual-keyboard";
import { FakeImeInputComponent } from "./components/fake-ime-input";
import { ImeSwitchComponent } from "./components/ime-switch/ime-switch";
import { HandlerPointerMode } from "./utils/pointer-mode-toggle";
import { CheckMultiStatus, ReportEvent } from "./utils/check-multi-status";

enum VirtualControlDisplayType {
  HideAll = 0,
  DisplayMobile = 1,
  DisplayPc = 2,
  DisplayAll = 3,
}

enum InputHoverButton {
  Hide,
  Display,
}

interface LoadingError {
  code: number | string;
  type: "app" | "task" | "connection" | "reConnection";
  reason: string | ErrorState;
}

interface StartClient {
  runningId: number;
  token?: string;
  enabledReconnect: boolean;
}

interface OnRunningOptions {
  token: string;
  coturns: RTCIceServer[];
  signaling: string;
}

interface ExtendUIOptions {
  onChange: (cb: OnChange) => void;
  // onQueue: (rank: number) => void;//私有云暂无排队功能
  onLoadingError: (err: LoadingError) => void;
  onRunningId: (runningId: number) => void;
  onRemoteConfig: (config: PrivateStartInfo) => void;
  onShowUserList: (showCastScreenUsers: boolean) => void;
  onRunningOptions: (opt: OnRunningOptions) => void;
  terminalMultiOpen: boolean;
  keyboardType: KeyboardType
  phaseTextMap?: Map<Phase, [number, string]>
}

export type ExtendBaseOptions = BaseOptionsType & { onlyRecvInstruction?: boolean }

type UIOptions = Options & ExtendUIOptions & loadingOptions;

export class LauncherPrivateUI {
  static defaultExtendOptions: ExtendUIOptions = {
    onChange: () => { },
    onLoadingError: () => { },
    onRunningId: () => { },
    onShowUserList: () => { },
    onRemoteConfig: () => { },
    onRunningOptions: () => { },
    terminalMultiOpen: false,
    keyboardType: KeyboardType.Virtual,
    phaseTextMap: undefined,
    ...LoadingComponent.defaultOptions,
  };
  loading: LoadingComponent;
  launcherBase?: LauncherBase;
  private location: URL;
  private client: Client;
  private extendUIOptions: ExtendUIOptions;
  private toolbarLogo?: string;
  private startClient?: Promise<StartClient>;
  private diffServerAndDiyOptions?: Options;
  private autoRetry: AutoRetry;
  private enabledReconnect: boolean = false;
  private offline: boolean = false;
  private tempOption?: DesignInfo;
  private privateReport?: PrivateReport;
  private token?: string;
  private runningId?: number
  private keepActiveHelper?: KeepActiveHelper
  private displayModeComponent?: DisplayModeModal
  private handlerPointerMode?: HandlerPointerMode
  private checkMultiStatus?: CheckMultiStatus
  // 投屏-观看端(分享)
  private get isGuest() {
    return this.baseOptions.startType === StartType.ScreenMode && !this.baseOptions.isCastScreenMaster
  }
  constructor(
    protected baseOptions: ExtendBaseOptions,
    protected hostElement: HTMLElement,
    protected options?: Partial<UIOptions>
  ) {
    this.extendUIOptions = {
      ...LauncherPrivateUI.defaultExtendOptions,
      ...options,
    };
    this.location = new URL(this.baseOptions.address);

    this.loading = new LoadingComponent(
      this.hostElement,
      { showDefaultLoading: false, phaseTextMap: this.extendUIOptions?.phaseTextMap ?? undefined },
      (cb: OnChange) => {
        this.extendUIOptions.onChange(cb);
      }
    );

    this.client = new Client(baseOptions.address);

    this.autoRetry = new AutoRetry(this.baseOptions.appKey!);

    this.client.getStartConfig(this.baseOptions.appKey!).then(async (res) => {
      if (!res.result) {
        this.handlerError({
          code: res.code,
          type: "app",
          reason: StatusMap.get(res.code as string) ?? res.message,
        });
        throw res.code;
      }
      const { terminalMultiOpen } = res.data;
      AutoRetry.StorageType =
        this.options?.terminalMultiOpen ?? terminalMultiOpen
          ? StorageType.SessionStorage
          : StorageType.LocalStorage;
      //判断有重连重连 - 仅普通连接
      this.handlerStart();
    });

    this.client
      .getDesignInfo()
      .then((res) => {
        if (!res.result) {
          this.handlerError({
            code: res.code,
            type: "app",
            reason: StatusMap.get(res.code as string) ?? res.message,
          });
          throw res.code;
        }
        return res.data;
      })
      .then((data) => {
        this.handlerMultipleOptions(data);
      });
  }
  private handlerStart() {
    //Todo：如果有本地缓存
    if (!this.autoRetry.isEmpty && !this.offline) {
      const { taskId } = this.autoRetry.getRetryInfo()!;
      this.handlerDetectTaskIsRunning(taskId).then((res) => {
        if (res.result) {
          //taskId关联进程还在运行
          // this.handlerStatusSwitch(res.data!);
          this.handlerRun();
        } else {
          //实际没有运行，清空
          this.autoRetry.clearRetryInfo();
          this.handlerStart();
        }
      });
      return;
    }
    this.handlerRun();
  }

  private handlerDetectTaskIsRunning(taskId: number) {
    return new Promise<{ result: boolean; data?: StatusPrivateInterface }>(
      (r) => {
        const res: Promise<StatusResponsePrivate> = this.client.statusPrivate({
          runningId: taskId,
          serverIp: this.location.hostname,
        });
        res
          .then((res) => {
            const { status } = res.data;
            if (status === "running") {
              //taskId关联进程还在运行
              r({ result: true, data: res.data });
            } else {
              //实际没有运行
              r({ result: false, data: res.data });
            }
          })
          .catch(() => r({ result: false }));
      }
    );
  }
  private handlerRun() {
    try {
      if (this.baseOptions.startType === 1 && !this.autoRetry.isEmpty) {
        this.startClient = this.client
          .getStartConfig(this.baseOptions.appKey!)
          .then(async (res) => {
            if (!res.result) {
              this.handlerError({
                code: res.code,
                type: "app",
                reason: StatusMap.get(res.code as string) ?? res.message,
              });
              throw res.code;
            }
            this.formatInitializeConfig(res.data);
            const { taskId: runningId } = this.autoRetry.getRetryInfo()!;
            const { enabledReconnect } = res.data;
            if (enabledReconnect) {
              this.autoRetry.initializeRetryInfo(runningId);
            }
            this.runningId = runningId
            this.enabledReconnect = enabledReconnect;
            this.extendUIOptions.onRunningId(runningId);
            return { runningId, enabledReconnect, token: undefined };
          });
      } else {
        //正常连接
        this.startClient = this.client
          .getPlayerUrlPrivate({
            ...this.baseOptions,
            onlyRecvInstruction: this.baseOptions.onlyRecvInstruction ?? false,
            serverIp: this.location.hostname,
          })
          .then(async (res) => {
            if (!res.result) {
              this.handlerError({
                code: res.code,
                type: "app",
                reason: StatusMap.get(res.code as string) ?? res.message,
              });
              throw res.code;
            }
            this.formatInitializeConfig(res.data);

            const { token, id: runningId, enabledReconnect } = res.data;
            if (enabledReconnect && this.baseOptions.startType === 1) {
              this.autoRetry.initializeRetryInfo(runningId);
            }
            this.enabledReconnect = enabledReconnect;
            this.extendUIOptions.onRunningId(runningId);
            return { token, runningId, enabledReconnect };
          });
      }
      this.startClient!.then(({ runningId, token, enabledReconnect }) => {
        if (this.baseOptions.startType === 1 && enabledReconnect) {
          window.addEventListener("offline", this.handlerOffline);
          if ("connection" in navigator) {
            (navigator as any).connection.addEventListener(
              "change",
              this.handlerNetworkChange
            );
          }
        }
        return this.waitForRunning(runningId, token);
      })
        .then((res) => this.handlerStatusSwitch(res))
        .catch((res) => {
          //只有重连以及有命中缓存才会触发 offline 为 true
          if (this.offline) {
            //断网了
            this.handlerRetryAction();
          }
        });
    } catch (_) {
      console.error(_);
    }
  }

  private handlerRetryAction() {
    const { count } = this.autoRetry.getRetryInfo()!;
    this.launcherBase?.playerShell.destroy();
    this.launcherBase?.player.destroy();
    this.destroy();

    //重新loading
    this.loading = new LoadingComponent(
      this.hostElement,
      { showDefaultLoading: false, phaseTextMap: this.extendUIOptions?.phaseTextMap ?? undefined },
      (cb: OnChange) => {
        this.extendUIOptions.onChange(cb);
      }
    );
    const { loadingImage, verticalLoading, horizontalLoading } =
      this.tempOption!;
    this.loading.loadingComponent.loadingImage =
      this.options?.loadingImage ?? loadingImage!;

    this.loading.loadingComponent.loadingBgImage = {
      portrait: this.options?.loadingBgImage?.portrait ?? verticalLoading!,
      landscape: this.options?.loadingBgImage?.landscape ?? horizontalLoading!,
    };

    this.loading.loadingComponent.loadingBarImage =
      this.options?.loadingImage ?? loadingImage!;

    this.loading.loadingComponent.showDefaultLoading =
      this.options?.showDefaultLoading ?? true;

    //第一次马上重连
    if (count === 1) {
      this.autoRetry.increaseRetryCount();
      this.handlerStart();
      return;
    }
    if (this.autoRetry.isOverMaxCount) {
      this.loading.showLoadingText("网络连接异常，请稍后重试", false);
      return;
    }

    this.loading.showLoadingText(
      `当前网络异常，正在尝试重连...(${count}/${AutoRetry.MaxCount})`,
      false
    );
    const increaseRetryRes = this.autoRetry.increaseRetryCount();
    if (increaseRetryRes) {
      this.handlerEntryConnect();
    } else {
      this.loading.showLoadingText("网络连接异常，请稍后重试", false);
      return;
    }
  }

  handlerEntryConnect() {
    this.autoRetry.handlerSetTimeout(() => {
      this.handlerStart();
    });
  }

  private handlerNetworkChange = () => {
    if ("connection" in navigator) {
      (navigator as any).connection.removeEventListener(
        "change",
        this.handlerNetworkChange
      );
    }

    this.offline = true;
    this.handlerRetryAction();
  };

  private handlerOffline = () => {
    window.removeEventListener("offline", this.handlerOffline);
    this.offline = true;
    this.handlerRetryAction();
  };

  private formatInitializeConfig(data: PrivateStartInfo) {
    let {
      appName = "Player",
      keyboardMappingConfig,
      pcFloatingButton,
      defaultBitrate,
      userList,
      needLandscape,
      landscapeType,
      keyboardType,
      openMultiTouch
    } = data;
    keyboardMappingConfig =
      keyboardMappingConfig &&
      typeof keyboardMappingConfig === "string" &&
      JSON.parse(keyboardMappingConfig);
    const display = this.checkVirtualDisplayType(data);
    const inputDisplayType = pcFloatingButton
      ? InputHoverButton.Display
      : InputHoverButton.Hide;

    document.title = appName;
    this.extendUIOptions.keyboardType = this.options?.keyboardType ?? keyboardType
    this.extendUIOptions.onRemoteConfig(data)
    this.extendUIOptions.onShowUserList(userList);

    const bitrate = handleNormalizeBitrate(
      this.options?.rateLevel ?? defaultBitrate
    );
    this.diffServerAndDiyOptions = {
      ...LauncherBase.defaultOptions,
      ...this.options,
      isFullScreen: this.options?.isFullScreen ?? false,
      openMultiTouch: this.options?.openMultiTouch ?? openMultiTouch,
      needLandscape: this.options?.needLandscape ?? needLandscape!,
      settingHoverButton: this.options?.settingHoverButton ?? display!,
      keyboardMappingConfig:
        this.options?.keyboardMappingConfig ?? keyboardMappingConfig!,
      inputHoverButton: this.options?.inputHoverButton ?? inputDisplayType!,
      rateLevel: this.options?.rateLevel ?? defaultBitrate,
      minBitrate: this.options?.minBitrate ?? bitrate,
      maxBitrate: this.options?.maxBitrate ?? bitrate,
      startBitrate: this.options?.startBitrate ?? bitrate,
      disablePointerManager: true,//写死，猫头接替处理这部分逻辑
      disablePointerLock: true,//写死，猫头接替处理这部分逻辑
      landscapeType: this.options?.landscapeType ?? landscapeType!,
    };
  }

  private checkVirtualDisplayType(data: PrivateStartInfo) {
    let { pcFloatingToolbar, mFloatingToolbar, mfloatingToolbar } = data;
    mFloatingToolbar = mFloatingToolbar! ?? mfloatingToolbar!;
    if (pcFloatingToolbar && mFloatingToolbar)
      return VirtualControlDisplayType.DisplayAll;
    if (pcFloatingToolbar) return VirtualControlDisplayType.DisplayPc;
    if (mFloatingToolbar) return VirtualControlDisplayType.DisplayMobile;
    return VirtualControlDisplayType.HideAll;
  }

  private handlerMultipleOptions(data: DesignInfo) {
    this.tempOption = data;
    const { loadingImage, horizontalLoading, verticalLoading, toolbarLogo } =
      data;
    this.toolbarLogo = toolbarLogo;
    this.loading.loadingComponent.loadingImage =
      this.options?.loadingImage ?? loadingImage!;

    this.loading.loadingComponent.loadingBgImage = {
      portrait: this.options?.loadingBgImage?.portrait ?? verticalLoading!,
      landscape: this.options?.loadingBgImage?.landscape ?? horizontalLoading!,
    };

    this.loading.loadingComponent.loadingBarImage =
      this.options?.loadingImage ?? loadingImage!;

    this.loading.loadingComponent.showDefaultLoading =
      this.options?.showDefaultLoading ?? true;
  }

  private handlerMountIme(ele: HTMLElement) {
    if (isTouch()) {
      if (this.extendUIOptions?.keyboardType === KeyboardType.Virtual) {
        new VirtualKeyboardComponent(ele,
          {
            onEvent: (ev) => this.launcherBase?.connection.send(ev, true)
          }).connect(this.launcherBase?.connection)
      } else {
        new FakeImeInputComponent(ele,
          {
            onEvent: (ev) => this.launcherBase?.connection.send(ev, true)
          }).connect(this.launcherBase?.connection)
      }
    } else {
      new ImeSwitchComponent(ele, { onEvent: (ev) => this.launcherBase?.connection.send(ev, true) }).connect(this.launcherBase?.connection)
    }

  }

  private waitForRunning = async (
    runningId: number,
    token?: string
  ): Promise<StatusResponsePrivate["data"]> => {
    const res = await this.client.statusPrivate({
      token,
      runningId,
      serverIp: this.location.hostname,
    });
    if (
      res.data.status === "running" ||
      res.data.status === "failed" ||
      res.data.status === "stopped"
    ) {
      return res.data;
    }
    await sleep(200);
    return await this.waitForRunning(runningId, token);
  };
  private initReportStatus = () => {
    this.checkMultiStatus = new CheckMultiStatus(
      new Map([
        [
          'signaling_delay',
          {
            callback: () => {
              !this.isGuest &&
                this.client.reportErrorCode(ReportEvent.SignalingDelay, this.runningId!)
            },
          },
        ],
        [
          'signaling_failure',
          {
            callback: () => {
              !this.isGuest &&
                this.client.reportErrorCode(ReportEvent.SignalingFailure, this.runningId!)
            },
          },
        ],
        [
          'ice',
          {
            callback: () => {
              !this.isGuest &&
                this.client.reportErrorCode(ReportEvent.Ice, this.runningId!)
            },
          },
        ],
        [
          'datachannel',
          {
            callback: () => {
              !this.isGuest &&
                this.client.reportErrorCode(ReportEvent.Datachannel, this.runningId!)
            },
          },
        ],
        [
          'peer_connection',
          {
            callback: () => {
              !this.isGuest &&
                this.client.reportErrorCode(ReportEvent.PeerConnection, this.runningId!)
            },
          },
        ],
      ]),
    )
  }
  private handlerStatusSwitch = (res: StatusPrivateInterface): void => {
    let { token = "", signaling, coturns, status } = res;
    const socketProtocol = this.location.protocol === "https:" ? "wss:" : "ws:";
    const host = this.location.host;
    signaling = `${socketProtocol}//${host}`;
    switch (status) {
      case "running":
      case "pending":
        this.extendUIOptions.onRunningOptions({
          token,
          coturns,
          signaling,
        });

        this.initReportStatus()

        this.token = token;
        const isAutoLoadingVideo =
          this.options?.autoLoadingVideo ?? !(isWeiXin() && isIOS());

        const options = {
          ...this.diffServerAndDiyOptions,
          autoLoadingVideo: isAutoLoadingVideo,
          toolbarLogo: this.options?.toolbarLogo ?? this.toolbarLogo,
          startType: this.baseOptions.startType,
          toolOption: {
            extendTools: (this.options?.toolOption?.extendTools ?? []).concat([
              {
                icon: displayModeIcon,
                text: "显示模式",
                platform: 1,
                order: 1,
                onClick: () => {
                  this.displayModeComponent!.show = true
                },
              },
              {
                icon: displayPointerIcon,
                text: '鼠标模式',
                platform: 1,
                order: 2,
                onClick: () => {
                  this.handlerPointerMode?.toggle(() => {
                    //TODO：鼠标模式，在观看端无权限时候应该禁止切换
                    this.launcherBase!.runningState.mouseMoveType = MoveType.Passive
                  })
                },
              },
            ])
          },

          onMount: (ele: HTMLElement) => {
            this.options?.onMount && this.options.onMount(ele)
            this.handlerMountIme(ele)
            if (!isTouch()) {
              this.displayModeComponent
                = new DisplayModeModal({
                  target: ele,
                  props:
                  {
                    show: false,
                    displayMode: this.diffServerAndDiyOptions?.landscapeType,
                    changeDisplayMode: (mode: LandscapeType) => { this.launcherBase?.player.handleChangeLandscapeType(mode) }
                  }
                })
            }

          },
          onQuit: () => {
            this.options?.onQuit && this.options.onQuit();
            //主动退出，清除taskId/runningId缓存
            this.autoRetry.clearRetryInfo();
          },
          onPhaseChange: (phase: Phase, deltaTime: number) => {
            this.options?.onPhaseChange &&
              this.options.onPhaseChange(phase, deltaTime);
            this.loading.changePhase(phase);

            if (phase === 'loaded-metadata') {
              this.keepActiveHelper?.resendKeyFrame()
            }
            if (phase === 'signaling-connected') {
              this.keepActiveHelper = new KeepActiveHelper(this.launcherBase!, this.hostElement)
              this.handlerPointerMode = new HandlerPointerMode(this.launcherBase?.player.video!, this.launcherBase?.connection!, false)

              this.checkMultiStatus?.toggleStateChange('signaling_delay', 'connected')
              this.checkMultiStatus?.toggleStateChange('signaling_failure', 'connected')
              this.launcherBase?.connection.event.iceStateChange.on((state) => {
                this.checkMultiStatus?.toggleStateChange('ice', state)
              })
              this.launcherBase?.connection.event.dataChannelConnected.on(() => {
                this.checkMultiStatus?.toggleStateChange('datachannel', 'connected')
              })
              this.launcherBase?.connection.event.peerConnectionConnected.on(() => {
                this.checkMultiStatus?.toggleStateChange('peer_connection', 'connected')
              })
              this.launcherBase?.connection.event.ready.on(() => {
                this.checkMultiStatus?.toggleStateChange('datachannel', 'checking')
                this.checkMultiStatus?.toggleStateChange('peer_connection', 'checking')
              })

            }

            if (phase === "streaming-ready" && !isAutoLoadingVideo) {
              autoLoadingVideo.set(false);
              autoLoadingVideoHandler.set(() => {
                this.launcherBase?.resumeVideoStream();
              });
              this.keepActiveHelper?.clearResendTimer()
            }
          },
          onPlay: () => {
            this.options?.onPlay && this.options?.onPlay();
            //只要进来，初始化重连缓存
            //去掉可以测试重连失败多次
            this.offline = false;
            if (this.enabledReconnect && !this.autoRetry.isEmpty) {
              this.autoRetry.setupCount(1);
            }
            this.loading.destroy();
            this.launcherBase?.toggleStatistics();
            this.privateReport = new PrivateReport(
              this.baseOptions.address,
              this.token!,
              this.launcherBase!
            );

            //多点触控情况下，快速触摸/抬起将模拟发送鼠标按下
            if (this.diffServerAndDiyOptions?.openMultiTouch) {
              new FastTouchSideEffect(this.launcherBase?.player.video!, () => {
                FastTouchSideEffect.sendMouseLeftButton(
                  this.launcherBase?.connection!
                );
              });
            }
            this.keepActiveHelper?.setKeepAlive()
            if (!isTouch()) {
              //Todo:后面需要在live-cat做终端区分，并统一处理
              //Note:pc端设置显示模式，移动端已在live-cat设置
              this.launcherBase?.player.handleChangeLandscapeType(this.diffServerAndDiyOptions?.landscapeType!)
            }
          },
          onError: (reason: ErrorState) => {
            this.options?.onError && this.options?.onError(reason);
            this.handlerError({
              code: reason, //Launcher error reason as code
              type: "connection",
              reason: ErrorStateMap.get(reason) ?? reason,
            });
            //todo：may loading destroy before emit error
            this.destroy(ErrorStateMap.get(reason) ?? reason);
          },
        };

        this.checkMultiStatus?.toggleStateChange('signaling_delay', 'checking')
        this.checkMultiStatus?.toggleStateChange('signaling_failure', 'checking')
        this.launcherBase = new LauncherBase(
          `${signaling}/clientWebsocket/${token}`,
          coturns,
          this.hostElement,
          options
        );
        try {
          this.launcherBase.connection.event.disconnect.on(() => {
            if (!this.checkMultiStatus?.handlerCheckIsStop('signaling_delay')) {
              this.checkMultiStatus?.handlerEmitCallBack('signaling_delay')
            }
          })
        } catch (error) {
          console.error(error)
        }
        break;
      case "failed":
        this.handlerError({
          code: "failed",
          type: "task",
          reason: "节点资源不足，勿刷新页面，请稍后重新进入",
        });
        break;
      case "stopped":
        this.handlerError({
          code: "stopped",
          type: "task",
          reason: "运行结束，勿刷新页面，请重新进入",
        });
        break;
      default:
        this.handlerError({
          code: "Unknown",
          type: "task",
          reason: "未知错误",
        });
        break;
    }
  };

  private handlerError(err: LoadingError) {
    if (
      this.enabledReconnect &&
      !this.autoRetry.isEmpty &&
      (err.type !== "connection" ||
        (err.type === "connection" && isAndroid())) && //Todo : public cloud to do
      err.type !== "task"
    ) {
      //在网络不稳定/断网的情况下，需要对重连进行适配
      this.offline = true; //设定为断网
      const { taskId } = this.autoRetry.getRetryInfo()!;
      this.handlerDetectTaskIsRunning(taskId)
        .then((res) => {
          if (res.result) {
            //taskId关联进程还在运行
            this.handlerRetryAction();
          } else {
            //断网的情况下重连/服务错误
            this.handlerRetryAction();
          }
        })
        .catch(() => {
          this.handlerRetryAction();
        });

      return;
    }

    if (
      !this.autoRetry.isEmpty &&
      err.type !== "connection" &&
      err.type !== "task"
    ) {
      //重连
      this.extendUIOptions.onLoadingError({
        code: err.code,
        type: "reConnection",
        reason: err.reason,
      });

      this.loading = new LoadingComponent(
        this.hostElement,
        { phaseTextMap: this.extendUIOptions?.phaseTextMap ?? undefined },
        (cb: OnChange) => {
          this.extendUIOptions.onChange(cb);
        }
      );
      setTimeout(() => {
        this.handlerStart();
      });
      return;
    }

    this.loading.loadingComponent.showDefaultLoading = false;
    this.loading.showLoadingText(err.reason, false);
    this.extendUIOptions.onLoadingError({
      code: err.code,
      type: err.type,
      reason: err.reason,
    });
  }

  liveStart(url?: string) {
    this.launcherBase?.connection.send(new LiveStart(url ?? '').dumps(), true)
  }
  liveStop() {
    this.launcherBase?.connection.send(new LiveStop().dumps(), true)
  }
  liveUrl(url: string) {
    this.launcherBase?.connection.send(new LiveURL(url).dumps(), true)
  }

  destroy(
    text: string = "连接已关闭",
    opt: { videoScreenshot: boolean } = { videoScreenshot: false }
  ) {
    if ("connection" in navigator) {
      (navigator as any).connection.removeEventListener(
        "change",
        this.handlerNetworkChange
      );
    }
    window.removeEventListener("offline", this.handlerOffline);
    this.autoRetry.destroy();
    this.loading.destroy();
    this.privateReport?.destroy();
    this.launcherBase?.player.showTextOverlay(text);
    if (opt.videoScreenshot) {
      this.loading.destroy();
      const imageUrl = takeScreenshotUrl(this.launcherBase?.player.video!, {
        accuracy: 5,
        alpha: 0.5,
      });
      this.launcherBase?.player.setUpOverlayElementBg(imageUrl);
    }
    this.keepActiveHelper?.destroy()
    this.launcherBase?.destroy();
  }
}
