const app = require('express')();
const routes = require('./routes/LeavesRoutes.js');

app.use('/', routes);

app.listen(3000, () => {
    console.log('Leaves API server started on port 3000');
});
