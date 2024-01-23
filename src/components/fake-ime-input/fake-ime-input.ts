import type { Connection } from "live-cat/types";
import FakeImeInput__SvelteComponent_ from "./fake-ime-input.svelte";
import { EventType, dataChannelMsgSorter } from "../../utils/extend-adapter";


export interface Options {
  onEvent: (e: ArrayBuffer) => void
  width: number
  height: number
}

export class FakeImeInputComponent {
  fakeImeInputComponent: FakeImeInput__SvelteComponent_
  private options: Options
  private imeRef?: HTMLDivElement
  static defaultOptions: Options = {
    onEvent: () => { },
    width: 1920,
    height: 1080,
  };
  constructor(protected readonly container: HTMLElement, options?: Partial<Options>) {
    this.options = { ...FakeImeInputComponent.defaultOptions, ...options }
    const { onEvent, width, height } = this.options
    this.fakeImeInputComponent = new FakeImeInput__SvelteComponent_({
      target: container,
      props: {
        onEvent,
        width,
        height,
        onRef: (ref: HTMLDivElement) => { this.imeRef = ref },
      }
    })
  }
  changeSize({ width = this.options.width, height = this.options.height }) {
    this.fakeImeInputComponent.width = width
    this.fakeImeInputComponent.height = height
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
