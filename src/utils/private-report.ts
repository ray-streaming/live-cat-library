import type { LauncherBase } from "live-cat/types";
export class PrivateReport {
  static Gap = 2000; //ms
  private intervalTimer?: number;
  constructor(
    private readonly address: string,
    private readonly token: string,
    private readonly launcherBase: LauncherBase
  ) {
    this.intervalTimer = window.setInterval(() => {
      this.send();
    }, PrivateReport.Gap);
  }
  private privateReportData() {
    const {
      fps,
      bitrate,
      packetLossRate,
      latency,
      framesReceived,
      framesDecoded,
      framesDropped = 0,
      averageJitterBufferDelay,
    } = this.launcherBase.report();
    let frames = (framesReceived - framesDecoded - framesDropped) / fps;
    frames = frames ? frames : Math.random() / 10;
    return {
      data: {
        fps,
        bitrate,
        packetLossRate,
        rtt: latency,
        frames: frames.toFixed(2),
        jitterBufferDelay: averageJitterBufferDelay,
      },
    };
  }
  private send() {
    const data = this.privateReportData();
    try {
      fetch(`${this.address}/app/running/data/report`, {
        method: "POST",
        body: JSON.stringify({ data: JSON.stringify(data), token: this.token }),
        headers: { "Content-Type": "application/json" },
      }).then((response) => response.json());
    } catch (_) {
      this.destroy();
    }
  }
  destroy() {
    window.clearInterval(this.intervalTimer);
  }
}
