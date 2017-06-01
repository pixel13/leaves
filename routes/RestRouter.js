class RestRouter
{
    constructor(express, paths)
    {
        this.routes = express.Router();

        for (let path of paths)
        {
            this._addRoutesForPath(path);
        }
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
        this.routes[obj.verb](resource, controller[method]);
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