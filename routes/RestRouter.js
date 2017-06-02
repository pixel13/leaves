class RestRouter
{
    constructor(express, paths)
    {
        this.routes = express.Router();

        this.routes.use(this._middlewareLogRequest);
        this.routes.use(this._middlewareCheckBody);

        for (let path of paths)
        {
            this._addRoutesForPath(path);
        }
    }

    _middlewareLogRequest(req, res, next)
    {
        next();
        console.log('Served: ' + req.method + ' on ' + req.originalUrl + ' (' + res.statusCode + ')');
    }

    _middlewareCheckBody(req, res, next)
    {
        if ((req.method !== 'PUT') && (req.method !== 'POST'))
            return next();

        if (req.get('Content-Type') !== 'application/json')
            return res.status(400).send('Missing required header Content-Type: application/json');

        if ((typeof req.body !== 'object') || (Object.keys(req.body).length === 0))
            return res.status(406).send('A non-empty, valid JSON body is required');

        next();
    }

    _addRoutesForPath(path)
    {
        var controllerName = this._getControllerFromPath(path);
        var Controller = require('../controllers/' + controllerName + 'Controller');
        var methods = Object.getOwnPropertyNames(Controller.prototype).filter(name => (name != "constructor"));
        var instance = new Controller();

        methods.forEach(method => this._addRouteForMethod(instance, method, path));
    }

    _addRouteForMethod(controller, method, path)
    {
        var obj = this._processMethodName(method);
        if (obj === null)
            return;

        var controllerName = controller.constructor.name;
        var resource = path + obj.resource;

        console.log('Adding route from  ' + controllerName + '.' + method + '(): ' + obj.verb.toUpperCase() + ' on ' + resource);
        this.routes[obj.verb](resource, controller[method].bind(controller));
    }

    _processMethodName(method)
    {
        var regex = /^(post|put|get|delete)(All)?$/i;
        var matches = method.match(regex);

        if (matches === null)
            return null;

        var verb = matches[1];
        var criteria = matches[2];

        return {
            verb: verb,
            resource: this._getResourceFromVerb(verb, criteria)
        };
    }

    _getResourceFromVerb(verb, criteria)
    {
        if ((verb === 'get') && (criteria === 'All'))
            return '/';

        if (verb === 'post')
            return '/';

        return '/:id';
    }

    _getControllerFromPath(path)
    {
        var name = path.replace('/', '').toLowerCase();
        return name.charAt(0).toUpperCase() + name.slice(1);
    }
}

module.exports = RestRouter;