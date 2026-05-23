[![DigitalOcean Referral Badge](https://web-platforms.sfo2.digitaloceanspaces.com/WWW/Badge%203.svg)](https://www.digitalocean.com/?refcode=4c3eee0af56f&utm_campaign=Referral_Invite&utm_medium=Referral_Program&utm_source=badge)

# React Avançado - Won Games API

## Requirements

This project uses [PostgreSQL](https://www.postgresql.org/), so, in order to make it working, install in your local machine or use Docker.

The configuration to the Database can be found on [config/database.js](config/database.ts)

## Development

After cloning this project, install the dependencies:

```
npm install
```

And run using:

```
npm run develop
```

The urls to access are:

- `http://localhost:1337/admin` - The Dashboard to create and populate data
- `http://localhost:1337/graphql` - GraphQL Playground to test your queries

The first time to access the Admin you'll need to create an user.

## Populate data

This project uses a `/games/populate` route in order to populate the data via GoG site.
In order to make it work, follow the steps:

- Go to Roles & Permissions > Public and make sure `game:populate` route is public available and the upload as well
- With Strapi running run the following comand in your console:

```bash
$ curl -X POST http://localhost:1337/games/populate

# you can pass query parameters like:
$ curl -X POST http://localhost:1337/games/populate?page=2
Free:
$ curl -X POST http://localhost:1337/games/populate?limit=10&price=between:0,0&order=desc:reviewsRating
Upcoming:
$ curl -X POST http://localhost:1337/games/populate?limit=10&releaseStatuses=in:upcoming&order=desc:reviewsRating
New Arrivals:
$ curl -X POST http://localhost:1337/games/populate?limit=10&releaseStatuses=in:new-arrival&order=desc:price
```

## Populate

1. Create a Postgres database and user:

```sh
CREATE USER wongames WITH ENCRYPTED PASSWORD 'wongames123';
CREATE DATABASE wongames OWNER wongames;
```

2. Populate the new database, adding key SEED=true in .env file:
