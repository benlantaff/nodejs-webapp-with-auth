# nodejs-webapp-with-auth

Node.js web application using express.js and mongodb. Includes sessions, security, and user authentication.

- `package.json` - Points to the app's main file and lists its details and dependencies.
- `server.js` - The nodejs server which serves up the application.
- `app.js` - Main express app.
- `index.ejs` - Web page that is displayed at [http://localhost:9001](http://localhost:9001)

# Getting started

- `git clone https://github.com/benlantaff/nodejs-webapp-with-auth.git` - Clone this repo to your local machine.
- `npm install` - Download all the application dependencies
- Update the session secret [`app.js`]
- Update the database and email details [`utilities.js`]
- `node server` - Fire up the server and navigate to the app [http://localhost:9001](http://localhost:9001)

# Resrouces

- [Node.js v18.2.0 documentation](https://nodejs.org/dist/latest-v18.x/docs/api/) - all of Node.js's documentation
- [Express.js](https://expressjs.com/) - official express.js site
- [Bootstrap ](https://getbootstrap.com/) - official bootstrap site w/ loads of documentation and examples
- [MongoDB](https://www.mongodb.com/) - helpful documentation, examples, setup a free MongoDB database
