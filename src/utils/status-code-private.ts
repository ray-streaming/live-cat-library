export const StatusMap = new Map([
  ["Token.Is.Exists", "token 已存在"],
  ["Token.Not.Exist", "token 不存在"],
  ["Not.IdleToken", "投屏端数量已到达上限"],
  ["Nickname.Exist", "昵称已存在"],
  ["Master.Controller.Not.Running", "主控端未开启"],
  ["App.Deleted", "链接不存在"],
  ["App.Off.Shelf", "应用已下架"],
  [
    "Concurrency.Exceed.License.Max",
    "当前打开的应用数量已达到 License 许可的最大限制！",
  ],
  ["App.MaxConcurrency", "当前打开的应用数量已达到应用最大限制！"],
  ["Password.Has.Been.Used", "该口令已被创建使用"],
  ["App.Share.Link.Not.Exist", "链接不存在"],
  ["App.Secret.Error", "访问密钥错误"],
  ["App.Not_Synced", "当前打开的应用未在节点同步！"],
]);
