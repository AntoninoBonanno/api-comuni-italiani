import axios from "axios";
import environment from "../environment";
import * as cheerio from "cheerio";
import fs from "fs";
import * as XLSX from "xlsx";
import IstatScanService from "../services/istat_scan-service";
import {ScanStatus} from "@prisma/client";
import AreaService from "../services/area-service";
import RegionService from "../services/region-service";
import ProvinceService from "../services/province-service";
import CityService from "../services/city-service";
import Logger from "./logger";

export default class IstatScraper {

    /**
     * Retrieve the PUBLICATION DATE from ISTAT archive url
     */
    static async getAvailableScanDate(): Promise<string> {
        const {data} = await axios.get(environment.istatUrl);
        const $ = cheerio.load(data);

        return $('.meta.date > span').text();
    }

    /**
     * Update the database from the ISTAT permalink
     */
    static async startScan(): Promise<void> {
        const availableScanDate = await IstatScraper.getAvailableScanDate(),
            lastScans = await IstatScanService.list(0, 5);

        const isUpdated = lastScans.some(lastScan =>
            lastScan.publishDate === availableScanDate && (lastScan.status === ScanStatus.COMPLETED || lastScan.status === ScanStatus.PROGRESS)
        );
        // if (isUpdated) {
        //     Logger.info('No updates available');
        //     return;
        // }

        const savePath = `${environment.storagePath}/${(new Date()).toLocaleTimeString()}.xls`;
        const istatScan = await IstatScanService.create({publishDate: availableScanDate});
        try {
            const rows = await IstatScraper.getFileRows(savePath);
            rows.shift(); // remove header row

            const newValues = {
                areas: new Map<string, number>(),
                regions: new Map<string, number>(),
                provinces: new Map<string, number>(),
                cities: new Map<string, number>(),
            }

            for (const row of rows) {
                const area = {
                    code: row.I.trim(),
                    name: row.J.trim()
                };
                if (!newValues.areas.has(area.code)) {
                    newValues.areas.set(area.code, (await AreaService.upsert(area)).id);
                }

                const region = {
                    areaId: newValues.areas.get(area.code)!,
                    code: row.A.trim(),
                    name: row.K.trim()
                };
                if (!newValues.regions.has(region.code)) {
                    newValues.regions.set(region.code, (await RegionService.upsert(region)).id);
                }

                const province = {
                    regionId: newValues.regions.get(region.code)!,
                    code: row.C.trim(),
                    name: row.L.trim(),
                    abbreviation: row.O.trim()
                }
                if (!newValues.provinces.has(province.code)) {
                    newValues.provinces.set(province.code, (await ProvinceService.upsert(province)).id);
                }

                const city = {
                    provinceId: newValues.provinces.get(province.code)!,
                    code: row.E.trim(),
                    name: row.F.trim(),
                    italianName: row.G.trim(),
                    otherLanguageName: row.H?.trim(),
                    cadastralCode: row.T.trim(),
                }
                if (!newValues.cities.has(city.code)) {
                    newValues.cities.set(city.code, (await CityService.upsert(city)).id);
                }
            }

            // Delete
            await CityService.deleteNotIn([...newValues.cities.values()]);
            await ProvinceService.deleteNotIn([...newValues.provinces.values()]);
            await RegionService.deleteNotIn([...newValues.regions.values()]);
            await AreaService.deleteNotIn([...newValues.areas.values()]);

            await IstatScanService.update(istatScan.id, {
                status: ScanStatus.COMPLETED,
                endAt: new Date()
            });
        } catch (e) {
            await IstatScanService.update(istatScan.id, {
                status: ScanStatus.ERROR,
                statusMessage: e.message,
                endAt: new Date()
            });
        } finally {
            fs.unlinkSync(savePath);
        }
    }

    private static async getFileRows(savePath: string): Promise<Array<{ [x: string]: string }>> {
        const {data} = await axios.get(environment.istatPermalink, {
            responseType: 'arraybuffer',
            headers: {
                'Content-Type': 'blob',
            }
        });
        fs.writeFileSync(savePath, data);

        const workbook = XLSX.read(savePath, {type: 'file'});
        const [firstSheetName] = workbook.SheetNames;
        const worksheet = workbook.Sheets[firstSheetName];

        return XLSX.utils.sheet_to_json(worksheet, {
            raw: false, // Use raw values (true) or formatted strings (false)
            header: "A"	// Row object keys are literal column labels
        });
    }
}