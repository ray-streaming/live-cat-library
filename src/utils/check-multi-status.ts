type Event = 'signaling_delay' | 'signaling_failure' | 'ice' | 'datachannel' | 'peer_connection'
type EventState = 'checking' | 'connected' | RTCIceConnectionState

interface EventCallBackType {
  callback: () => void
}

export enum ReportEvent {
  SignalingDelay = 10001, //web_socket未连接(超时)
  SignalingFailure = 10002, // 信令连接失败
  Ice = 10003,//ice异常
  Datachannel = 10004, //通信通道未打开(超时)
  PeerConnection = 10005, // 串流通道未打开(超时)
}

export class CheckMultiStatus {
  private timers: { [event: string]: number } = {}
  /* eslint-disable prettier/prettier */
  constructor(
    private readonly multiDelayCallBackMap: Map<Event, EventCallBackType> = new Map([]),
    private readonly delay: number = 20 * 1000,
  ) { }
  toggleStateChange(event: Event, state: EventState) {
    const multiDelayCallBack = this.multiDelayCallBackMap.get(event)
    if (!multiDelayCallBack) {
      throw new Error(`Invalid callback event ${event}.`)
    }
    switch (state) {
      case 'checking':
        this.startTimer(event, multiDelayCallBack.callback)
        break
      case 'connected':
        this.stopTimer(event)
        break
      default:
        this.stopTimer(event)
        break
    }
  }

  handlerCheckIsStop(event: Event) {
    return !this.timers[event]
  }
  handlerEmitCallBack(event: Event) {
    const callBackFc = this.multiDelayCallBackMap.get(event)
    if (!callBackFc) {
      throw new Error(`Invalid callback event ${event}.`)
    }
    callBackFc.callback && callBackFc.callback()
    this.stopTimer(event)
  }
  private startTimer(event: string, callback: () => void) {
    const timer = window.setTimeout(callback, this.delay)
    this.timers[event] = timer
  }

  private stopTimer(event: Event) {
    if (this.timers[event]) {
      window.clearTimeout(this.timers[event])
      delete this.timers[event]
      console.log(`Timer ${event} stopped.`)
    } else {
      throw new Error(`Invalid event ${event}.`)
    }
  }
}
