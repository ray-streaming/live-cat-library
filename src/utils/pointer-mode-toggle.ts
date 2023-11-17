import { Connection, PointerManager } from "live-cat";
import type { Cursor } from "ray-streaming/types/utils";

export class HandlerPointerMode {
  private _isSubscribe = false
  private pointerManager?: PointerManager
  private cursor?: Cursor
  constructor(private readonly target: HTMLElement, connection: Connection, private readonly disablePointerLock?: boolean) {
    connection.event.cursor.on((cursor) => {
      console.log('cursor', cursor)
      this.cursor = cursor
    })
  }
  get isSubscribe() {
    return this._isSubscribe
  }
  toggle(cb?: () => void) {
    if (!this._isSubscribe) {
      this.pointerManager?.destroy()
      this.pointerManager = new PointerManager(
        this.target,
        () => {
          if (this._isSubscribe) {
            this.toggle()
          }
          this._isSubscribe = false
        },
        this.disablePointerLock,
      )
      this.cursor && this.pointerManager?.setCursor(this.cursor)
      this._isSubscribe = true
    } else {
      this.pointerManager?.destroy()
      this._isSubscribe = false
    }
    cb && cb()
  }
}
