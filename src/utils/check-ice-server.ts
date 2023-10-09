export class CheckIceServers {
  private timer: number = NaN
  constructor(
    private readonly onDelayCallBack: () => void = () => { },
    private readonly delay: number = 2000
  ) { }
  toggleStateChange(state: RTCIceConnectionState) {
    switch (state) {
      case 'checking':
        this.timer = window.setTimeout(this.onDelayCallBack, this.delay)
        break;
      case 'connected':
        window.clearTimeout(this.timer)
        break;
    }
  }
}
