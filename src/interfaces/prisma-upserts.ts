export interface IAreaUpsert {
    code: string,
    name: string
}

export interface IRegionUpsert extends IAreaUpsert {
    areaId: number
}

export interface IProvinceUpsert extends IAreaUpsert {
    regionId: number,
    abbreviation: string
}

export interface ICityUpsert extends IAreaUpsert {
    provinceId: number,
    italianName: string,
    otherLanguageName?: string,
    cadastralCode: string,
    capital: boolean
}
