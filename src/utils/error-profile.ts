import type { ErrorState } from "live-cat/types/launcher-base";
export type extendErrorState = ErrorState | "iceServers-disconnect"
export const ErrorStateMap = new Map<extendErrorState, string>([
  ["disconnect", "连接已断开"],
  ["hangup", "连接已断开"],
  ["hangup", "连接已断开"],
  ["afk", "您的应用长时间未进行操作，已自动结束运行"],
  ["kick", "当前应用已在其他页面打开"],
  ["iceServers-disconnect", "网络异常"],
]);
