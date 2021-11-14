# API Comuni italiani

Unofficial API service, which returns information on Italian **areas**, **regions**, **provinces** and **cities**.

Service realized with Node.js server based on the Express framework and on the MySQL database.

- Source of data: [ISTAT](https://www.istat.it/it/archivio/6789)
- Project structure based
  on [Express Startup Project](https://github.com/AntoninoBonanno/express-startup-project#express-startup-project)

### Features

- Automatic database update (The [ISTAT Permalink](https://www.istat.it/storage/codici-unita-amministrative/Elenco-comuni-italiani.xls) is checked
  every 5 months - configurable)
- API divided by [**areas**](/docs/api.md#areas), [**regions**](/docs/api.md#regions), [**provinces**](/docs/api.md#provinces) and [**cities**](/docs/api.md#cities) with the possibility of filtering the data. (See [documentation](/docs/api.md))

## Startup instructions 

### From Docker (production)

Starting an "API Comuni italiani" instance is simple:

```
docker run -p 8000:8000 -e DATABASE_URL="database-connection-string" --name api-comuni-italiani -d antoninobonanno/api-comuni-italiani:latest
```

NOTE:
- The `database-connection-string` must be of the format `mysql://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}`
  - For example `mysql://root:@host.docker.internal:3306/comuni-italiani` (use `host.docker.internal` instead of `localhost` as `DB_HOST` if you have a local database, not in a docker container)

#### use docker-compose

You can see the example present in [docker/docker-compose.yml](docker/docker-compose.yml) and run the command:

```
docker-compose -f docker/docker-compose.yml -p api-comuni-italiani up -d
```

**Environment Variables**

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `connection string` | **Required**. The database connection string: `mysql://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}` |
| `APP_NAME` | `string` | **Optional**. The name of app: default `API Comuni Italiani` |
| `APP_ENV` | `development, production` | **Optional**. The environment mode: default `production` |
| `APP_PORT` | `integer` | **Optional**. The local (internal) port where the server is exposed: default `8000` |
| `ISTAT_SCAN_MONTHLY_PERIOD` | `integer` | **Optional**. How many months you want to scan on the ISTAT site, started every first day of month at 10:00: default `5` |

### From Clone (development)

0. Clone the repository
1. Copy and rename `.env.example` file to `.env` and edit settings
2. Run `npm install` command to install dependencies
3. Run `npx prisma migrate dev` command to initialize the database or `npx prisma generate` command if the database
   already exists
4. Run `npm start` or `npm run dev` command to run local server (it restarts each time the code is changed)

### TODO

- [ ] Bug cron, helpers/istat-scraper.ts line 34: [Issue opened](https://github.com/kelektiv/node-cron/issues/587)

## Support me

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/C0C46QJ0M)

## Getting Involved

Want to help out? Found a bug? Missing a feature? Post an issue on
our [issue tracker](https://github.com/AntoninoBonanno/api-comuni-italiani/issues).

I welcome contributions no matter how small or big!
