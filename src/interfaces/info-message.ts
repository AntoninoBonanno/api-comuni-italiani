export default interface IInfoMessage extends IUpdateInfo {
    message: string,
    _count: {
        areas: number,
        regions: number,
        provinces: number,
        cities: number
    }
}

export interface IUpdateInfo {
    availableDatabase: string,
    currentDatabase: string,
    lastCheck: string,
    nextCheck: string,
    isUpdated: boolean,
}
