import type { Connection } from "live-cat/types";
import VirtualKeyboard from "./virtual-keyboard.svelte";
import SizeNav from "./size-nav.svelte";
import { EventType, dataChannelMsgSorter } from "../../utils/extend-adapter";
import type Keyboard from 'simple-keyboard'
import { KeyboardSizeType, LanguageType, allLayoutKey } from "./virtual-keyboard-config";

export interface Options {
  onEvent: (e: ArrayBuffer) => void
  defaultSize: KeyboardSizeType
  defaultLanguage: LanguageType
}

export class VirtualKeyboardComponent {
  virtualKeyboardComponent: VirtualKeyboard
  SizeNavComponent: SizeNav
  private options: Options
  private keyboardRef?: HTMLDivElement
  private sizeNavRef?: HTMLDivElement
  private keyboard?: Keyboard
  static defaultOptions: Options = {
    onEvent: () => { },
    defaultSize: 'medium',
    defaultLanguage: 'en'
  };
  constructor(protected readonly container: HTMLElement, options?: Partial<Options>) {
    this.options = { ...VirtualKeyboardComponent.defaultOptions, ...options }
    const { onEvent, defaultSize, defaultLanguage } = this.options
    this.virtualKeyboardComponent = new VirtualKeyboard({
      target: container,
      props: {
        onEvent,
        defaultSize,
        defaultLanguage,
        onRef: (ref: HTMLDivElement) => { this.keyboardRef = ref },
        onKeyboard: (ins: Keyboard) => { this.keyboard = ins },
        onClose: () => this.inactive()
      }
    })
    this.SizeNavComponent = new SizeNav({
      target: container,
      props: {
        defaultSize,
        onRef: (ref: HTMLDivElement) => { this.sizeNavRef = ref },
        changeKeyboardSize: (type: KeyboardSizeType) => { this.changeKeyboardSize(type) }
      }
    })
  }
  changeKeyboardSize(size: KeyboardSizeType) {
    this.keyboard?.setOptions({
      buttonTheme: [
        {
          class: size,
          buttons: allLayoutKey,
        },
      ],
    })
  }
  active() {
    this.keyboardRef!.style.display = 'flex';
    this.sizeNavRef!.style.display = 'inline-flex';
  }
  inactive() {
    this.keyboardRef!.style.display = 'none';
    this.sizeNavRef!.style.display = 'none';
  }
  connect(connection?: Connection) {
    connection?.dc.addEventListener('message', (msg) => {
      if (dataChannelMsgSorter(msg.data) === EventType.CaretVisible) {
        const res = !!new DataView(msg.data).getUint8(1)
        res ? this.active() : this.inactive()
      }
    })
  }
  destroy() {
    this.virtualKeyboardComponent.$destroy()
    this.SizeNavComponent.$destroy()
  }
}
