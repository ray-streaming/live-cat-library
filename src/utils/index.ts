import type { Connection } from "live-cat";

export const isWeiXin = () =>
  navigator.userAgent.includes("miniProgram") ||
  navigator.userAgent.includes("MicroMessenger");

export const isIOS = () => {
  return (
    [
      "iPad Simulator",
      "iPhone Simulator",
      "iPod Simulator",
      "iPad",
      "iPhone",
      "iPod",
    ].includes(navigator.platform) ||
    (navigator.userAgent.includes("Mac") && "ontouchend" in document)
  );
};
export function isTouch() {
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) ||
    (navigator.userAgent.includes("Mac") && "ontouchend" in document) ||
    "ontouchstart" in document ||
    matchMedia("(pointer:coarse)").matches
  );
}
export function isAndroid() {
  return (
    navigator.userAgent.indexOf('Android') > -1 ||
    navigator.userAgent.indexOf('Adr') > -1 ||
    (('ontouchstart' in document || matchMedia('(pointer:coarse)').matches) && !isIOS())
  )
}
export function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
export function iceParse(ice: string[], enableTCP = false): RTCIceServer[] {
  return ice.map((server) => {
    const [urls, auth] = server.split("@");
    const [username, credential] = auth.split(":");
    return {
      urls: [enableTCP ? urls.concat("?transport=tcp") : urls],
      username,
      credential,
    };
  });
}

export function takeScreenshotUrl(
  videoElement: HTMLVideoElement,
  opt: { accuracy: number; alpha: number }
) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  canvas.width = videoElement.videoWidth / (opt.accuracy ?? 1);
  canvas.height = videoElement.videoHeight / (opt.accuracy ?? 1);
  ctx.globalAlpha = opt.alpha ?? 1;
  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  const dataUrl = canvas.toDataURL();
  return dataUrl;
}
export const handlerSendAgoraVerfy = async (
  content: Connection,
  agoraServiceVerify: string
) => {
  content
    .emitUIInteraction(
      JSON.stringify({ _Agora_Service_Verify: agoraServiceVerify })
    )
    .then(async (result) => {
      if (!result) {
        await sleep(200);
        await handlerSendAgoraVerfy(content, agoraServiceVerify);
      }
      return result;
    });
};

export enum RateLevel {
  SD,
  HD,
  FHD,
  UHD4K,
}

export type RateMapType = {
  label: string;
  value: number;
};

export const rateMapField = new Map<RateLevel, RateMapType>([
  [RateLevel.SD, { label: "流畅", value: 1500 }],
  [RateLevel.HD, { label: "高清", value: 4000 }],
  [RateLevel.FHD, { label: "超清", value: 8000 }],
  [RateLevel.UHD4K, { label: "蓝光", value: 15000 }],
]);

export const handleNormalizeBirate = (defaultBitrate: number) => {
  const rateLevel = rateMapField.get(defaultBitrate);
  return rateLevel?.value ?? rateMapField.get(RateLevel.HD)!.value;
};
