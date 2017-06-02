const config = require('./config/config.json');
const express = require('express');
const bodyParser = require('body-parser');
const Router = require('./routes/RestRouter.js');

var app = express();
var routes = new Router(express, config.paths).routes;

app.use(bodyParser.json());
app.use('/', routes);

app.listen(3000, () => {
    console.log('Leaves API server started on port 3000');
});
