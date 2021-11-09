import * as dotenv from "dotenv";

dotenv.config();
const environment = {
    /**
     * The app name
     */
    appName: process.env.APP_NAME || 'My App',

    /**
     * The environment mode
     */
    appEnv: process.env.APP_ENV || 'development',

    /**
     * Return true if app is in production mode
     */
    isProduction: (): boolean => environment.appEnv !== 'development',

    /**
     * The app port
     */
    port: process.env.APP_PORT || 8000,

    /**
     * The app timezone
     */
    timezone: process.env.APP_TIMEZONE || 'Europe/Rome',

    /**
     * Path of Storage directory
     */
    storagePath: `${__dirname}/../storage`,

    /**
     * The URL of istat Permalink xls
     */
    istatPermalink: 'https://www.istat.it/storage/codici-unita-amministrative/Elenco-comuni-italiani.xls',

    /**
     * Set how many months you want to scan on the ISTAT site, started every first day of month at 10:00
     */
    istatScanMonthlyPeriod: (!process.env.ISTAT_SCAN_MONTHLY_PERIOD || process.env.ISTAT_SCAN_MONTHLY_PERIOD < '1' || process.env.ISTAT_SCAN_MONTHLY_PERIOD > '12') ? '3' : process.env.ISTAT_SCAN_MONTHLY_PERIOD
};

export default environment;
