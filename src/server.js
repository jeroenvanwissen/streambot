require('dotenv').config();

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const loadModules = require('./lib/modules').loadModules;

const app = express();
const server = require('http').createServer(app);

const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'pug');
app.set('views', 'src');

app.get('/', (req, res) => res.render('views/home'));
app.use(
    '/socket.io',
    express.static(
        path.join(__dirname, '..', 'node_modules', 'socket.io-client', 'dist')
    )
);

loadModules(path.join(__dirname, 'modules'), app, server);

server.listen(port, () =>
    console.log(`StreamBot webinterface listening on port ${port}`)
);
