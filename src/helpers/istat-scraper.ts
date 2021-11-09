import fs from "fs";
import axios from "axios";
import {CronJob} from "cron";
import Logger from "./logger";
import * as XLSX from "xlsx";
import environment from "../environment";
import {ScanStatus} from "@prisma/client";
import AreaService from "../services/area-service";
import RegionService from "../services/region-service";
import ProvinceService from "../services/province-service";
import CityService from "../services/city-service";
import IstatScanService from "../services/istat_scan-service";
import IIstatFile, {IIstatDatabase} from "../interfaces/istat-file";
import {IUpdateInfo} from "../interfaces/info-message";
import {IAreaUpsert, ICityUpsert, IProvinceUpsert, IRegionUpsert} from "../interfaces/prisma-upserts";

export default class IstatScraper {
    private static job: CronJob | undefined;

    /**
     * Add cronjob, started every first day of month at 10:00
     */
    static initCronJob(): void {
        IstatScraper.job = new CronJob(`0 10 1 */${environment.istatScanMonthlyPeriod} *`, () => {
            Logger.info('[CronJob] Start Istat scan');
            IstatScraper.startScan().then(_ => {
                Logger.info('[CronJob] End Istat scan');
            });
        }, null, true, environment.timezone);
        IstatScraper.startScan(false).then();
    }

    /**
     * Check if there are any updates, or the database is already up to date
     * @param istatFile the cached istat file, if undefined retrieve new file and and is then deleted
     */
    static async checkUpToDate(istatFile?: IIstatFile): Promise<IUpdateInfo> {
        if (!istatFile) {
            istatFile = await IstatScraper.getIstatFile();
            IstatScraper.deleteIstatFile(istatFile); // Delete stored file
        }
        const lastScans = await IstatScanService.list(0, 5, {
            status: {
                in: [ScanStatus.COMPLETED, ScanStatus.PROGRESS]
            }
        }).catch(_ => []);
        const lastScan = lastScans[0];

        const isUpdated = lastScans.some(lastScan => lastScan.databaseName === istatFile!.databaseName);
        return {
            availableDatabase: istatFile.databaseName,
            currentDatabase: isUpdated ? istatFile.databaseName : (lastScan ? lastScan.databaseName : 'None'),
            lastCheck: lastScan ? (lastScan.status === ScanStatus.PROGRESS ? 'In progress' : lastScan.startAt.toISOString()) : 'Never',
            nextCheck: IstatScraper.job ? IstatScraper.job.nextDates().toISOString() : 'CronJob unset',
            isUpdated
        };
    }

    /**
     * Update the database from the ISTAT permalink
     * @return success true if scan end with success, else error message
     */
    static async startScan(saveAttempt: boolean = true): Promise<void> {
        const istatFile = await IstatScraper.getIstatFile(),
            updateInfo = await IstatScraper.checkUpToDate(istatFile);

        if (updateInfo.isUpdated) {
            if (saveAttempt) {
                await IstatScanService.create({
                    status: ScanStatus.COMPLETED,
                    databaseName: istatFile.databaseName,
                    statusMessage: 'No updates available',
                    endAt: new Date()
                });
            } else {
                Logger.info('[IstatScraper] No updates available');
            }
            IstatScraper.deleteIstatFile(istatFile);
            return;
        }

        const istatScan = await IstatScanService.create({databaseName: istatFile.databaseName});
        try {
            const rows = (await IstatScraper.getIstatDatabase(istatFile)).rows;
            rows.shift(); // remove header row

            // Cached values, prevent re-update same value in the database Map<IstatCode, DatabaseId>
            const cache = {
                areas: new Map<string, number>(),
                regions: new Map<string, number>(),
                provinces: new Map<string, number>(),
                cities: new Map<string, number>(),
            }

            for (const row of rows) {
                // Store or update areas
                const area: IAreaUpsert = {
                    code: row.I.trim(),
                    name: row.J.trim()
                };
                if (!cache.areas.has(area.code)) {
                    cache.areas.set(area.code, (await AreaService.upsert(area)).id);
                }

                // Store or update regions
                const region: IRegionUpsert = {
                    areaId: cache.areas.get(area.code)!,
                    code: row.A.trim(),
                    name: row.K.trim()
                };
                if (!cache.regions.has(region.code)) {
                    cache.regions.set(region.code, (await RegionService.upsert(region)).id);
                }

                // Store or update provinces
                const province: IProvinceUpsert = {
                    regionId: cache.regions.get(region.code)!,
                    code: row.C.trim(),
                    name: row.L.trim(),
                    abbreviation: row.O.trim()
                }
                if (!cache.provinces.has(province.code)) {
                    cache.provinces.set(province.code, (await ProvinceService.upsert(province)).id);
                }

                // Store or update cities
                const city: ICityUpsert = {
                    provinceId: cache.provinces.get(province.code)!,
                    code: row.E.trim(),
                    name: row.F.trim(),
                    italianName: row.G.trim(),
                    otherLanguageName: row.H?.trim(),
                    cadastralCode: row.T.trim(),
                }
                if (!cache.cities.has(city.code)) {
                    cache.cities.set(city.code, (await CityService.upsert(city)).id);
                }
            }

            // Delete not updated values
            await CityService.deleteNotIn([...cache.cities.values()]);
            await ProvinceService.deleteNotIn([...cache.provinces.values()]);
            await RegionService.deleteNotIn([...cache.regions.values()]);
            await AreaService.deleteNotIn([...cache.areas.values()]);

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
            Logger.error(`[IstatScraper] Error updating database: ${e.stack}`);
        } finally {
            IstatScraper.deleteIstatFile(istatFile);
        }
    }

    /**
     * Convert xls file in json object
     * @param istatFile the cached istat file, if undefined retrieve new file
     * @return istatDatabase the istat database
     */
    private static async getIstatDatabase(istatFile?: IIstatFile): Promise<IIstatDatabase> {
        if (!istatFile) {
            istatFile = await IstatScraper.getIstatFile();
        }

        const workbook = XLSX.read(istatFile.filePath, {type: 'file'});
        const worksheet = workbook.Sheets[istatFile.databaseName];

        return {
            filePath: istatFile.filePath,
            databaseName: istatFile.databaseName,
            rows: XLSX.utils.sheet_to_json(worksheet, {
                raw: false, // Use raw values (true) or formatted strings (false)
                header: "A"	// Row object keys are literal column labels
            })
        };
    }

    /**
     * Retrieve the xls file from istat Permalink xls
     * @return istatFile the istat file info
     */
    private static async getIstatFile(): Promise<IIstatFile> {
        if (!fs.existsSync(`${environment.storagePath}/`)) {
            fs.mkdirSync(`${environment.storagePath}/`);
        }

        const filePath = `${environment.storagePath}/${(new Date()).getTime()}.xls`;
        const {data} = await axios.get(environment.istatPermalink, {
            responseType: 'arraybuffer',
            headers: {
                'Content-Type': 'blob',
            }
        });

        fs.writeFileSync(filePath, data);

        const workbook = XLSX.read(filePath, {type: 'file'});
        const [firstSheetName] = workbook.SheetNames;
        return {
            filePath,
            databaseName: firstSheetName
        };
    }

    /**
     * Delete the istatFile from storage
     * @param istatFile cached istatFile
     */
    private static deleteIstatFile(istatFile: IIstatFile): void {
        if (fs.existsSync(istatFile.filePath)) {
            fs.unlinkSync(istatFile.filePath);
        }
    }
}
