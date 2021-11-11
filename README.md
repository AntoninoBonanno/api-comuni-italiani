# API Comuni italiani

Unofficial API service, which returns information on Italian **areas**, **regions**, **provinces** and **cities**.

Service realized with Node.js server based on the Express framework and on the MySQL database.

- Source of data: [ISTAT](https://www.istat.it/it/archivio/6789)
- Project structure based
  on [Express Startup Project](https://github.com/AntoninoBonanno/express-startup-project#express-startup-project)

### Features

- Automatic database update (The [ISTAT Permalink](https://www.istat.it/storage/codici-unita-amministrative/Elenco-comuni-italiani.xls) is checked
  every 3 months - configurable)
- API divided by [**areas**](/docs/api.md#areas), [**regions**](/docs/api.md#regions), [**provinces**](/docs/api.md#provinces) and [**cities**](/docs/api.md#cities) with the possibility of filtering the data. (See [documentation](/docs/api.md))

## Docker 

#### Build
`docker build -t antoninobonanno/api-comuni-italiani .`

#### Run
<s>`docker run -p 8000:8000 -e DATABASE_URL="mysql://root:@localhost:3306/comuni-italiani" --name api-comuni-italiani -d antoninobonanno/api-comuni-italiani`</s>

`docker-compose up -d`


## Support me

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/C0C46QJ0M)

## Development Instructions

1. Copy and rename `.env.example` file to `.env` and edit settings
2. Run `npm install` command to install dependencies
3. Run `npx prisma migrate dev` command to initialize the database or `npx prisma generate` command if the database
   already exists
4. Run `npm start` or `npm run dev` command to run local server (it restarts each time the code is changed)

### TODO

- [ ] How run `npx prisma migrate deploy` automatically (docker)
- [ ] Bug cron, helpers/istat-scraper line 25: [Issue opened](https://github.com/kelektiv/node-cron/issues/587)

## Getting Involved

Want to help out? Found a bug? Missing a feature? Post an issue on
our [issue tracker](https://github.com/AntoninoBonanno/api-comuni-italiani/issues).

I welcome contributions no matter how small or big!
