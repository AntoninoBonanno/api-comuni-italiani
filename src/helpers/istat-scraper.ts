import axios from "axios";
import environment from "../environment";
import * as cheerio from "cheerio";
import fs from "fs";
import * as XLSX from "xlsx";
import IstatScanService from "../services/istat_scan-service";
import {ScanStatus} from "@prisma/client";
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
        if (isUpdated) {
            Logger.info('No updates available');
            return;
        }

        const savePath = `${environment.storagePath}/${availableScanDate}.xls`;

        const updatedItems = 0;
        const istatScan = await IstatScanService.create({publishDate: availableScanDate});
        try {
            const rows = await IstatScraper.getFileRows(savePath);
            rows.shift(); // remove header row

            const newValues = {
                areas: new Map<string, string>(),
                regions: new Map<string, string>(),
                provinces: new Map<string, string>(),
                cities: new Map<string, string>(),
            }

            rows.forEach((row, index) => {
                const element = {
                    regionCode: row.A,
                    regionName: row.K,
                    provinceCode: row.C,
                    provinceName: row.L,
                    provinceAbbreviation: row.O,
                    cityCode: row.E,
                    cityName: row.F,
                    cityItalianName: row.G,
                    cityOtherLanguageName: row.H,
                    cityCadastralCode: row.T,
                    areaCode: row.I,
                    areaName: row.J,
                }
                console.log(row);
            });

            await IstatScanService.update(istatScan.id, {
                status: ScanStatus.COMPLETED,
                endAt: new Date(),
                updatedItems
            });
        } catch (e) {
            await IstatScanService.update(istatScan.id, {
                status: ScanStatus.ERROR,
                statusMessage: e.message,
                endAt: new Date(),
                updatedItems
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