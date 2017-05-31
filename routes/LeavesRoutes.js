class Router
{
    constructor(express, paths)
    {
        //this.routes = express.Router();

        for (let path of paths)
        {
            this._addRoutesForPath(path);
        }
    }

    _addRoutesForPath(path)
    {
        var Controller = require('../controllers/' + this._ucfirst(path) + 'Controller');
        var methods = Object.getOwnPropertyNames(Controller.prototype).filter(name => (name != "constructor"));
        var call = new Controller();

        methods.forEach(name => this._addRouteForMethod(name));
    }

    _addRouteForMethod(name)
    {
        console.log('Adding route for ' + name);
    }

    _ucfirst(text)
    {
        return text.charAt(0).toUpperCase() + text.toLowerCase().slice(1);
    }
}

const routes = require('express').Router();
var controller = require('../controllers/LeavesController');

routes.get('/', (req, res) => {
    var r = new Router('express', ['leaves']);
   res.sendStatus(200);
});
/*
routes.get('/leaves', controller.getAll );
routes.post('/leaves', controller.addLeave );
*/
module.exports = routes;