<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->
  
# NestJS CRUD API using MongoDB database 

## Description

An API made with NestJS to accomplish CRUD operations to create users accounts and store them in a MongoDB database with hashed password. After the user is register, an email message and a Rabbit event is send to the user. Furthermore, the operations of get and delete users of MongoDB database are available (update operations are not available).

## Installation

To install all node dependencies of the project, run the following command:

```bash
$ npm install
```

## Set Environment variables

To improve segurity to the user of the application, .ENV variables must be used to access the MongoDB database and the email service, like the following steps:

1°: create a config.env file in the root directory

2°: set the following variables:
```
MONGODB_URI={URI of MongoDB to create a connection}
MONGODB_PASSWORD={Password of the database}
# mail
MAIL_HOST={SMTP server hostname}
MAIL_PORT={Port number of SMTP server (587 is recommended)}
MAIL_USER={Username of the Email account that will send e-mails}
MAIL_PASSWORD={Password of the email account that will send emails}

```

## API Endpoints

```POST``` /api/users: create a new user. The body of the request must be contain the following keys: name, password, email and file (should be in multipart/form-data).
```GET``` /api/users/{userId}: get a user by ID.
```GET``` /api/users/{userId}/avatar: get a user's avatar base64 encoded.
```DELETE``` /api/users/{userId}: delete a user.

## Create a new user
- URL: `POST /api/users`
- Description: Creates a new user account with the given details.
- Request Body:
  | Key | Value |
  |--------------|--------------------------|
  | name | Turtle |
  | password | securePassword622 |
  | email | turtle@email.com |
  | file | [Image](https://f.i.uol.com.br/fotografia/2022/10/27/1666892737635ac3c11d0f7_1666892737_3x2_md.jpg)|
- Response Body:
```json
{
    "name": "Turtle",
    "password": "$2b$10$zfydohNhMvtnF92R0miynOUu3BfGQ9s6bvZnH2jhIYRN5pVC0lRbu",
    "email": "turtle@email.com",
    "imageName": "1682685914553tartaruga.jpg"
}
```
- An email and a RabbitMQ event must be sent to the user.
  
## Get an user by Id
- URL: `GET /api/users/{Id}`
- Description: Get the user by Id.
- Response Body:
```json
{
    "name": "Turtle",
    "email": "turtle@email.com"
}
```

## Get user avatar image by user Id

- URL: `GET /api/users/{Id}/avatar`
- Description: Get the user avatar with Id of the user.
- Response Body: encoded base64 image

### Delete a user avatar

- URL: `DELETE /api/users/{Id}/avatar`
- Description: Delete the user avatar with the Id of the user.
This Avatar has been removed of the database:
```json
{
  _id: new ObjectId("644bbfda9312c311f9a33f16"),
  userId: '644bbfda9312c311f9a33f14',
  imageName: '1682685914553tartaruga.jpg',
  base64: 
  Binary.createFromBase64(encoded base64 image, 0)
}
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
