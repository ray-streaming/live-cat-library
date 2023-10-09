import type { Connection } from "live-cat/types";
import FakeImeInput__SvelteComponent_ from "./fake-ime-input.svelte";
import { EventType, dataChannelMsgSorter } from "../../utils/extend-adapter";


export interface Options {
  onEvent: (e: ArrayBuffer) => void
}

export class FakeImeInputComponent {
  fakeImeInputComponent: FakeImeInput__SvelteComponent_
  private options: Options
  private imeRef?: HTMLDivElement
  static defaultOptions: Options = {
    onEvent: () => { },
  };
  constructor(protected readonly container: HTMLElement, options?: Partial<Options>) {
    this.options = { ...FakeImeInputComponent.defaultOptions, ...options }
    const { onEvent } = this.options
    this.fakeImeInputComponent = new FakeImeInput__SvelteComponent_({
      target: container,
      props: {
        onEvent,
        onRef: (ref: HTMLDivElement) => { this.imeRef = ref },
      }
    })
  }

  active() {
    this.imeRef!.style.display = 'flex';
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
