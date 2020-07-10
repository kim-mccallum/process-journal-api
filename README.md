# [Process Journal](https://process-journal-client.vercel.app/) API

If you have not already, please read the [Process Journal Client readme](https://github.com/kim-mccallum/process-journal-client/blob/master/README.md) for information about this project.

## About

This API services the Process Journal React client application and comprises an Express server coupled with a PostgreSQL database. The database stores user information from the process journal client. This server has authentication endpoints for creating an account, logging in and access user journal data such as user goals, process variables, habits and journal entries. Passwords are securely hashed and stored and authentication is handled using JWT.

A typical request pattern looks like this:

- A user visits the Process Journal client application, creates an account and makes a POST request to store their username, email and hashed password in the database.
- A user logs in by submitting a POST request to the login endpoint. Their hashed password is compared to the database and if valid, a token is returned to the client.
- As users interact with the app, they make repeated POST and GET requests to the protected endpoints: `api/goal`, `api/process_variable`, `api/habit`, `api/goal/current`, `api/process_variable/current`, `api/habit/current` and `api/entries` endpoints. Requests are validated, responses are sent accordingly and the user data is returned and rendered in the UI.

## Technologies

- [Node.js](https://nodejs.org/en/)
- [Express](https://expressjs.com/)
- [Knex.js](http://knexjs.org/)
- [PostgreSQL](https://www.postgresql.org/)

#### Notes

Process Journal is currently hosted on Heroku and as such, the API can take a few moments to 'wake up' when you first interact with it.

## Scripts

Start the application `npm start`

Start nodemon for the application `npm run dev`

Run the tests `npm test`

## Deploying

When this project is ready to be updated and redeployed, simply run `npm run build` and then `npm run deploy` which will push to this remote's master branch.
