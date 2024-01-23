import type { Connection } from "live-cat/types";
import ImeSwitch__SvelteComponent_ from "./ime-switch.svelte"
import { EventType, dataChannelMsgSorter } from "../../utils/extend-adapter";


export interface Options {
  onEvent: (e: ArrayBuffer) => void
}

export class ImeSwitchComponent {
  imeSwitchComponent: ImeSwitch__SvelteComponent_
  private options: Options
  private imeRef?: HTMLDivElement
  static defaultOptions: Options = {
    onEvent: () => { },
  };
  constructor(protected readonly container: HTMLElement, options?: Partial<Options>) {
    this.options = { ...ImeSwitchComponent.defaultOptions, ...options }
    const { onEvent } = this.options
    this.imeSwitchComponent = new ImeSwitch__SvelteComponent_({
      target: container,
      props: {
        onEvent,
        onRef: (ref: HTMLDivElement) => { this.imeRef = ref },
      }
    })
  }

  active() {
    this.imeRef!.style.display = 'block';
  }
  inactive() {
    this.imeRef!.style.display = 'none';
  }
  connect(connection?: Connection) {
    connection?.dc.addEventListener('message', (msg) => {
      if (dataChannelMsgSorter(msg.data) === EventType.CaretVisible) {
        const res = !!new DataView(msg.data).getUint8(1)
        res ? this.active() : this.inactive()
      }
    })
  }

}
