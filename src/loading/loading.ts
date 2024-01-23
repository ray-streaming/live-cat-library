import Loading from "./loading.svelte";
import {
  showFakePercent,
  endPercentNum,
  loadingText,
  currentPercentNum,
} from "../store";
import { PhasePercentMap } from "./phase-profile";
import type { Phase } from "live-cat/types/launcher-base";

export interface Options {
  loadingImage: string | HTMLImageElement;
  loadingBgImage: { portrait: string; landscape: string };
  loadingBarImage: string | HTMLImageElement;
  showDefaultLoading: boolean;
  showLoadingBarLogo: boolean
  showFakePercent: boolean;

  phaseChanged: boolean;
  percentChanged: boolean;

  phaseTextMap?: Map<Phase, [number, string]>
}
export interface OnChange {
  phase: Phase;
  fakePercent: number;
  deltaTime: number;
}

export class LoadingComponent {
  static defaultOptions: Options = {
    loadingImage: "",
    loadingBgImage: { portrait: "", landscape: "" },
    loadingBarImage: "",
    showDefaultLoading: true,
    showLoadingBarLogo: true,
    showFakePercent: true,

    phaseChanged: true,
    percentChanged: true,

    phaseTextMap: undefined

  };
  loadingComponent: Loading;
  private options: Options;
  // private onChange: (cb: OnChange) => void;

  // @see https://github.com/rbuckton/reflect-metadata, but decorators are not stableable
  private _deltaTimeMetadata: number;
  private _phase?: Phase;
  private _percent: number = 0;
  set phase(v: Phase) {
    this._phase = v;
    this.options.phaseChanged &&
      this.handleAllChange(~~(performance.now() - this._deltaTimeMetadata));
  }
  get phase() {
    return this._phase!;
  }

  set percent(v: number) {
    this._percent = v;
    this.options.percentChanged &&
      this.handleAllChange(~~(performance.now() - this._deltaTimeMetadata));
  }
  get percent() {
    return this._percent;
  }
  constructor(
    protected container: HTMLElement,
    options?: Partial<Options>,
    protected onChange?: (cb: OnChange) => void
  ) {
    this.options = {
      ...LoadingComponent.defaultOptions,
      ...options,
    };
    this.changePhase("initial");
    this._deltaTimeMetadata = performance.now();
    const {
      loadingImage,
      loadingBgImage,
      showDefaultLoading,
      showLoadingBarLogo,
      loadingBarImage,
    } = this.options;

    this.loadingComponent = new Loading({
      target: container,
      props: {
        host: container,
        loadingImage,
        loadingBgImage,
        loadingBarImage,
        showDefaultLoading,
        showLoadingBarLogo
      },
    });
    currentPercentNum.subscribe((percent) => {
      this.percent = percent;
    });
  }
  showLoadingText(text: string, showPercent?: boolean) {
    showFakePercent.set(showPercent! ?? this.options.showFakePercent);
    loadingText.set(text);
  }

  changePhase(phase: Phase) {
    try {
      const [percent, text] = this.options.phaseTextMap ? this.options.phaseTextMap.get(phase)! : PhasePercentMap.get(phase)!;
      this.phase = phase;
      showFakePercent.set(this.options.showFakePercent); //reset
      endPercentNum.set(percent);
      loadingText.set(text);
    } catch {
      throw new Error(`No detail was found for this phase: "${phase}"`);
    }
  }
  private handleAllChange(deltaTime: number) {
    this.onChange &&
      this.onChange({
        phase: this.phase,
        fakePercent: this.percent,
        deltaTime: deltaTime,
      });
  }
  destroy() {
    this.loadingComponent.$destroy();
  }
}
