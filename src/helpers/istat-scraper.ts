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
    private static storageDir: string = `${environment.storagePath}/istat_files/`;

    /**
     * Add cronjob, started every first day of month at 10:00
     */
    static initCronJob(): void {
        IstatScraper.job = new CronJob(`0 10 1 */${environment.istatScanMonthlyPeriod()} *`, () => {
            fs.rmSync(IstatScraper.storageDir, {recursive: true, force: true}); // clear storage dir
            IstatScraper.startScan().then();
        }, null, true, environment.timezone);
        IstatScraper.startScan(false).then();
    }

    /**
     * Check if there are any updates, or the database is already up to date
     * @param istatFile the cached istat file, if undefined retrieve new file and and is then deleted
     */
    static async checkUpToDate(istatFile?: IIstatFile): Promise<IUpdateInfo> {
        if (!istatFile) {
            istatFile = await IstatScraper.getIstatFile().then(istatFile => {
                IstatScraper.deleteIstatFile(istatFile); // Delete stored file
                return istatFile;
            }).catch(_ => undefined);
        }

        const lastScans = await IstatScanService.list(0, 5, {
            OR: [
                {status: ScanStatus.COMPLETED},
                {
                    status: ScanStatus.PROGRESS,
                    startAt: {
                        // The scan takes less than 10 minutes.
                        // If there are scans in progress with more than 10 minutes it means that
                        // the server was stopped during the scan
                        gte: new Date(Date.now() - 1000 * (60 * 10))
                    }
                }]
        }).catch(_ => []); // Get last 5 scans with status COMPLETED | PROGRESS

        const lastScan = lastScans[0];
        const isUpdated = istatFile ? lastScans.some(lastScan => lastScan.databaseName === istatFile!.databaseName) : false;
        return {
            availableDatabase: istatFile?.databaseName ?? 'Error in retrieving ISTAT info',
            currentDatabase: lastScan?.databaseName ?? 'None',
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
        Logger.info('[IstatScraper] Start Istat scan');
        const istatFile = await IstatScraper.getIstatFile(),
            updateInfo = await IstatScraper.checkUpToDate(istatFile);

        if (updateInfo.isUpdated) {
            if (saveAttempt) {
                await IstatScanService.create({ // Store completed attempt with 'No updates available' message
                    status: ScanStatus.COMPLETED,
                    databaseName: istatFile.databaseName,
                    statusMessage: 'No updates available',
                    endAt: new Date()
                }).catch(e => {
                    Logger.error(`[IstatScraper] No updates available -> error: ${e.stack}`);
                });
            } else {
                Logger.info('[IstatScraper] No updates available');
            }
            return IstatScraper.deleteIstatFile(istatFile);
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
                    capital: row.N.trim() === '1'
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

            await IstatScanService.update(istatScan.id, { // Store completed attempt
                status: ScanStatus.COMPLETED,
                endAt: new Date()
            });
            Logger.info('[IstatScraper] End Istat scan');
        } catch (e) {
            await IstatScanService.update(istatScan.id, { // Store error attempt
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
            // If cached istatFile is undefined retrieve new file
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
        if (!fs.existsSync(IstatScraper.storageDir)) {
            // Make storage dir if not exists
            fs.mkdirSync(IstatScraper.storageDir, {recursive: true});
        }

        // Get and store file from ISTAT permalink
        const filePath = `${IstatScraper.storageDir}${(new Date()).getTime()}.xls`;
        const {data} = await axios.get(environment.istatPermalink, {
            responseType: 'arraybuffer',
            headers: {
                'Content-Type': 'blob',
            }
        }).catch(e => {
            throw new Error(`[IstatScraper] Error in retrieving the file: ${e.stack}`);
        });

        fs.writeFileSync(filePath, data);

        // Read file and get the database name (first sheet name)
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
