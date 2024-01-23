export enum EventType {
  CaretVisible = 8,
  EchoData = 15,
  LIVE_START = 0x34,
  LIVE_STOP,
  LIVE_URL,
}


export const dataChannelMsgSorter = (data: ArrayBuffer) =>
  new DataView(data).getUint8(0) as EventType



export class LiveStart {
  constructor(private url?: string) { }
  dumps() {
    const encoder = new TextEncoder()
    const view = encoder.encode(this.url ?? '')
    const dv = new DataView(new ArrayBuffer(5 + view.length))
    dv.setUint8(0, EventType.LIVE_START)
    dv.setUint32(1, view.length)
    view.forEach((v, i) => dv.setUint8(5 + i, v))
    return dv.buffer
  }
}

export class LiveStop {
  constructor() { }
  dumps() {
    const buffer = new ArrayBuffer(1)
    const dv = new DataView(buffer)
    dv.setUint8(0, EventType.LIVE_STOP)
    return dv.buffer
  }
}

export class LiveURL {
  constructor(private url: string) { }
  dumps() {
    if (!this.url) {
      throw Error('url的长度必须大于0')
    }
    const encoder = new TextEncoder()
    const view = encoder.encode(this.url)
    const dv = new DataView(new ArrayBuffer(5 + view.length))
    dv.setUint8(0, EventType.LIVE_URL)
    dv.setUint32(1, view.length)
    view.forEach((v, i) => dv.setUint8(5 + i, v))
    return dv.buffer
  }
}
