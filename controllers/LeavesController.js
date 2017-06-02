const RestController = require('./RestController.js');

class LeavesController extends RestController
{
    constructor()
    {
        super('leaves');
    }

    getAll(req, res)
    {
        super.getAll(req, res, 'year', 'month', 'day');
    }

    get(req, res)
    {
        super.get(req, res);
    }

    post(req, res)
    {
        super.post(req, res);
    }

    put(req, res)
    {
        super.put(req, res);
    }

    delete(req, res)
    {
        super.delete(req, res);
    }
}

module.exports = LeavesController;