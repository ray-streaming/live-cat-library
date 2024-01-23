import type { LauncherBase } from "live-cat/types"
import audio from './empty-audio.mp3'
export class KeepActiveHelper {
  static dataChannelResendKeyFrameGop = 500
  static audio = audio
  private resendTimer: number = 0
  private audioEle?: HTMLAudioElement
  constructor(private readonly launcherBase: LauncherBase, private readonly host: HTMLElement) {}
  resendKeyFrame() {
    const { width, height } = this.launcherBase.player.video
    this.resendTimer = window.setTimeout(() => {
      this.launcherBase.connection.changeEncodeResolution({
        width: width,
        height: height,
      })
    }, KeepActiveHelper.dataChannelResendKeyFrameGop)
  }
  clearResendTimer() {
    window.clearInterval(this.resendTimer)
  }
  setKeepAlive() {
    this.host.addEventListener(
      'touchstart',
      () => {
        this.audioEle = document.createElement('audio')
        this.audioEle.src = KeepActiveHelper.audio
        this.audioEle.loop = true
        this.audioEle.autoplay = true
        this.audioEle.onload = () => {
          this.audioEle?.play()
          this.audioEle?.addEventListener('timeupdate', this.onTimeupdate)
        }
      },
      { once: true },
    )
  }
  private onTimeupdate() {
    const threshold = 0.1
    if (this.audioEle) {
      if (this.audioEle.currentTime >= this.audioEle.duration - threshold) {
        this.audioEle.currentTime = 0
      }
    }

  }
  private clearAudioElement() {
    if (this.audioEle) {
      this.audioEle.pause();
      this.audioEle.currentTime = 0;
      this.audioEle.removeEventListener('timeupdate', this.onTimeupdate);
      this.audioEle.parentNode?.removeChild(this.audioEle);
    }
  }
  destroy() {
    this.clearAudioElement()
    this.clearResendTimer()
  }
}

