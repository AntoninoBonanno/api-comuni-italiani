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
     * Path of Storage directory
     */
    storagePath: `${__dirname}/../storage`,

    /**
     * The URL of istat archive
     */
    istatUrl: 'https://www.istat.it/it/archivio/6789',

    /**
     * The URL of istat Permalink xls
     */
    istatPermalink: 'https://www.istat.it/storage/codici-unita-amministrative/Elenco-comuni-italiani.xls'
};

export default environment;
