# API Comuni italiani
Node.js server based on the Express framework and on the MySQL database that returns the list of Italian regions, provinces and cities

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/C0C46QJ0M)

Project structure based on [Express Startup Project](https://github.com/AntoninoBonanno/express-startup-project#express-startup-project)

## Development Instructions

1. Copy and rename `.env.example` file to `.env` and edit settings
2. Run `npm install` command to install dependencies
3. Run `npx prisma migrate dev` command to initialize the database or `npx prisma generate` command if the database already exists
4. Run `npm start` or `npm run dev` command to run local server (it restarts each time the code is changed)

NOTE:
- import the file `docs/API Comuni italiani.postman_collection.json` to Postman to test the API

### TODO
- [ ] Create script to populate database from [ISTAT Permalink](https://www.istat.it/it/archivio/6789)
- [ ] Update APIs
- [ ] Add dockerfile

## Getting Involved

Want to help out? Found a bug? Missing a feature? Post an issue on our [issue tracker](https://github.com/AntoninoBonanno/api-comuni-italiani/issues).

I welcome contributions no matter how small or big!
