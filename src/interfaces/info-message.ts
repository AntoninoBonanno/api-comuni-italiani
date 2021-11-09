export default interface IInfoMessage extends IUpdateInfo {
    message: string,
}

export interface IUpdateInfo {
    availableDatabase: string,
    currentDatabase: string,
    lastCheck: string,
    nextCheck: string,
    isUpdated: boolean,
}
