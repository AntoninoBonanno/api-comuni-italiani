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

};

export default environment;
