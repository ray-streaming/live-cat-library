# live-cat-library

> This is a component library for [3DCAT](https://www.3dcat.live/)

# live-cat Launcher

<p align="center">
<a title="MIT" target="_blank" href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/license-MIT-orange.svg?style=flat-square"></a>
<a title="npm bundle size" target="_blank" href="https://www.npmjs.com/package/live-cat"><img alt="npm bundle size" src="https://img.shields.io/bundlephobia/minzip/live-cat?style=flat-square&color=blueviolet"></a>
<a title="Version" target="_blank" href="https://www.npmjs.com/package/live-cat"><img src="https://img.shields.io/npm/v/live-cat.svg?style=flat-square"></a><br>
<a title="Downloads" target="_blank" href="https://www.npmjs.com/package/live-cat"><img src="https://img.shields.io/npm/dt/live-cat.svg?style=flat-square&color=97ca00"></a>
<a title="jsdelivr" target="_blank" href="https://www.jsdelivr.com/package/npm/live-cat"><img src="https://data.jsdelivr.com/v1/package/npm/live-cat/badge"/></a>
</p>

# Features：

- [x] Loading Component
- [ ] ScreenManager Component
- [x] AgoraRTCVerify Component
- [x] LauncherUI
- [x] LauncherPrivateUI

# Technologies

- live-cat v1.1.5
- Svelte v3.57.0
- Rollup v2.78.0
- Typescript v4.9.5

# quick start

## instantiation parameter

```typescript
interface BaseOptionsType {
  address: string; // address
  appId?: string; // appId
  appKey?: string; // appKey
  appSecret?: string; // appSecret
  startType?: StartType;
  castScreenMaxQty?: number;
  castScreenNickname?: string;
  castScreenPwd?: string;
  isCastScreenMaster?: boolean;
  serverIp?: string; //for coturn server
  joinType?: ScreenJoinType; //only screen
  optionalParam?: string; // command line parameters
  exeParameter?: string; // command line parameters for privatization
  enableVirtualCamera?: boolean; // setup camera enable
}
```

> Options detail to see [live-cat](https://www.npmjs.com/package/live-cat?activeTab=readme)

```typescript
type UIOptions = Options & loadingOptions & ExtendUIOptions;

interface loadingOptions {
  loadingImage: string | HTMLImageElement;
  loadingBgImage: { portrait: string; landscape: string };
  loadingBarImage: string | HTMLImageElement;
  showDefaultLoading: boolean;
  showFakePercent: boolean;

  phaseChanged: boolean;
  percentChanged: boolean;
}
interface ExtendUIOptions {
  onChange: (cb: OnChange) => void;
  onQueue: (rank: number) => void;
  onLoadingError: (err: LoadingError) => void;
  onTaskId: (taskId: number) => void;
  onShowUserList: (showCastScreenUsers: boolean) => void;
  onRunningOptions: (opt: OnRunningOptions) => void;
}

interface OnChange {
  phase: Phase;
  fakePercent: number;
  deltaTime: number;
}

type Phase =
  | "initial"
  | "signaling-connected"
  | "node-ready"
  | "end-candidate"
  | "peer-connection-connected"
  | "data-channel-open"
  | "streaming-ready"
  | "loaded-metadata"
  | "streaming-playing";

interface LoadingError {
  code: number | string;
  type: "app" | "task" | "connection" | "reConnection";
  reason: string | ErrorState;
}

type ErrorState = "disconnect" | "afk" | "kick" | "hangup";

interface OnRunningOptions {
  token: string;
  coturns: RTCIceServer[];
  signaling: string;
}
enum StartType {
  NormalMode = 1,
  ScreenMode = 3,
}
enum ScreenJoinType {
  Secret = 1,
  Link,
}
```

```typescript
//when terminal is ios and wechat
onPhaseChange: (phase: Phase, deltaTime: number) => {
  if (phase === "data-channel-open") {
    /* NOTE: Autoplay video need user activation gesture
     * @see https://html.spec.whatwg.org/multipage/interaction.html#user-activation-processing-model
     */
    someTriggerElement.addEventListener("click", () =>
      launcher?.launcherBase?.resumeVideoStream()
    );
  }
};
```

```typescript
//Microphone

//Start capture audio to node
onPhaseChange: (phase: Phase, deltaTime: number) => {
  if (phase === "data-channel-open") {
    launcher?.launcherBase?.openMicrophone();
  }
};
//Stop
launcher?.launcherBase?.closeMicrophone();
```

```typescript
//Camera
const baseOptionsType = {
  address: "xxxx",
  appKey: "xxxx",
  startType: 1,
  enableVirtualCamera: true,
};
let launcher = new LauncherUI(baseOptionsType, container);

//Start capture video to node
onPhaseChange: (phase: Phase, deltaTime: number) => {
  if (phase === "data-channel-open") {
    launcher?.launcherBase?.openCamera();
  }
};
//Stop
launcher?.launcherBase?.closeCamera();
```

```typescript
// Public Cloud
import { LauncherUI } from "live-cat-library";

const container = document.querySelector("body");
document.querySelector("body").style.width = "100%";
document.querySelector("body").style.height = "100%";
const baseOptionsType = {
  address: "https://app.3dcat.live",
  appKey: "xxxx",
  startType: 1,
};
const uiOptions = {
  loadingImage: "",
};
let launcher = new LauncherUI(baseOptionsType, container, uiOptions);

window.addEventListener("DOMContentLoaded", () => {
  if (
    navigator.userAgent.includes("miniProgram") ||
    navigator.userAgent.includes("MicroMessenger")
  ) {
    //wechat
    document.addEventListener("WeixinJSBridgeReady", bootstrap, false);
  } else {
    bootstrap();
  }
});
```

```typescript
// Private Cloud
import { LauncherPrivateUI } from "live-cat-library";

const container = document.querySelector("body");
document.querySelector("body").style.width = "100%";
document.querySelector("body").style.height = "100%";
const baseOptionsType = {
  address: "xxxxx",
  appKey: "xxxx",
  startType: 1,
};
const uiOptions = {
  loadingImage: "",
};
let launcher = new LauncherPrivateUI(baseOptionsType, container, uiOptions);

window.addEventListener("DOMContentLoaded", () => {
  if (
    navigator.userAgent.includes("miniProgram") ||
    navigator.userAgent.includes("MicroMessenger")
  ) {
    //wechat
    document.addEventListener("WeixinJSBridgeReady", bootstrap, false);
  } else {
    bootstrap();
  }
});
```

# License

MIT
