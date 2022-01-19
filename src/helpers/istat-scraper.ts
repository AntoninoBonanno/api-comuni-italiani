import fs from "fs";
import axios from "axios";
import {CronJob} from "cron";
import Logger from "./logger";
import * as XLSX from "xlsx";
import * as https from "https";
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
import {InternalServerErrorException} from "../exceptions/http-exceptions";

export default class IstatScraper {
    static messages = {
        errorIstat: 'Error in retrieving ISTAT info',
        databaseEmpty: 'None',
        progress: 'In progress',
        neverScan: 'Never',
        cronUnset: 'CronJob unset'
    };

    private static job: CronJob | undefined;
    private static storageDir: string = `${environment.storagePath}/istat_files/`;

    /**
     * Add cronjob, started every first day of month at 10:00
     */
    static initCronJob(): void {
        this.job = new CronJob(`0 10 1 */${environment.istatScanMonthlyPeriod()} *`, () => {
            fs.rmSync(this.storageDir, {recursive: true, force: true}); // clear storage dir
            this.startScan().catch(error => Logger.error(`[CronJob] ${error.stack}`));
        }, null, true);
    }

    /**
     * Check if there are any updates, or the database is already up-to-date
     * @param istatFile the cached istat file, if undefined retrieve new file and is then deleted
     */
    static async checkUpToDate(istatFile?: IIstatFile): Promise<IUpdateInfo> {
        if (!istatFile) {
            istatFile = await this.getIstatFile().then(file => {
                this.deleteIstatFile(file); // Delete stored file
                return file;
            }).catch(e => {
                Logger.error(e);
                return undefined
            });
        }

        const lastScan = await IstatScanService.lastValidScan().catch(_ => undefined); // COMPLETED || PROGRESS
        let lastCheck = this.messages.neverScan;
        if (lastScan) {
            lastCheck = (lastScan.status === ScanStatus.PROGRESS ? this.messages.progress : lastScan.startAt.toISOString());
        }

        return {
            availableDatabase: istatFile?.databaseName ?? this.messages.errorIstat,
            currentDatabase: lastScan?.databaseName ?? this.messages.databaseEmpty,
            lastCheck,
            nextCheck: this.job ? this.job.nextDates().toISOString() : this.messages.cronUnset,
            isUpdated: (istatFile && lastScan) ? lastScan.databaseName === istatFile.databaseName : false
        };
    }

    /**
     * Update the database from the ISTAT permalink
     * @return success true if scan end with success, else error message
     */
    static async startScan(): Promise<void> {
        Logger.info('[IstatScraper] Start Istat scan');
        const istatFile = await this.getIstatFile(),
            updateInfo = await this.checkUpToDate(istatFile);

        if (updateInfo.isUpdated) {
            await IstatScanService.create({ // Store completed attempt with 'No updates available' message
                status: ScanStatus.COMPLETED,
                databaseName: istatFile.databaseName,
                statusMessage: 'No updates available',
                endAt: new Date()
            }).catch(e => {
                Logger.error(`[IstatScraper] No updates available -> error: ${e.stack}`);
            });
            Logger.info('[IstatScraper] No updates available');
            return this.deleteIstatFile(istatFile);
        }

        const istatScan = await IstatScanService.create({databaseName: istatFile.databaseName});
        try {
            const rows = (await this.getIstatDatabase(istatFile)).rows;
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
            this.deleteIstatFile(istatFile);
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
            istatFile = await this.getIstatFile();
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
        if (!fs.existsSync(this.storageDir)) {
            // Make storage dir if not exists
            fs.mkdirSync(this.storageDir, {recursive: true});
        }

        // Get and store file from ISTAT permalink
        const filePath = `${this.storageDir}${(new Date()).getTime()}.xls`;
        const {data} = await axios.get(environment.istatPermalink, {
            responseType: 'arraybuffer',
            headers: {
                'Content-Type': 'blob',
            },
            httpsAgent: new https.Agent({rejectUnauthorized: false})
        }).catch(e => {
            throw new InternalServerErrorException(`[IstatScraper] Error in retrieving the file: ${e.stack}`);
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
