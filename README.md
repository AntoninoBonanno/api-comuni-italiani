# API Comuni italiani

Unofficial API service, which returns information on Italian **regions**, **provinces** and **cities**.

Service realized with Node.js server based on the Express framework and on the MySQL database.

- Source of data: [ISTAT](https://www.istat.it/it/archivio/6789)
- Project structure based
  on [Express Startup Project](https://github.com/AntoninoBonanno/express-startup-project#express-startup-project)

### Features

- Automatic database update (
  The [ISTAT Permalink](https://www.istat.it/storage/codici-unita-amministrative/Elenco-comuni-italiani.xls) is checked
  every X months)
- API divided by **regions**, **provinces** and **cities** with the possibility of filtering the data. (
  See [documentation](/docs/api.md))

## Support me

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/C0C46QJ0M)

## Development Instructions

1. Copy and rename `.env.example` file to `.env` and edit settings
2. Run `npm install` command to install dependencies
3. Run `npx prisma migrate dev` command to initialize the database or `npx prisma generate` command if the database
   already exists
4. Run `npm start` or `npm run dev` command to run local server (it restarts each time the code is changed)

### TODO

- [ ] Add dockerfile

## Getting Involved

Want to help out? Found a bug? Missing a feature? Post an issue on
our [issue tracker](https://github.com/AntoninoBonanno/api-comuni-italiani/issues).

I welcome contributions no matter how small or big!
