const express = require('express');
const Router = require('./routes/RestRouter.js');

var app = express();
var routes = new Router(express, ['/leaves']).routes;

app.use('/', routes);

app.listen(3000, () => {
    console.log('Leaves API server started on port 3000');
});
