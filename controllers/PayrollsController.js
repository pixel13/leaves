const RestController = require('./RestController.js');

class PayrollsController extends RestController
{
    constructor()
    {
        super('payrolls');
    }

    getAll(req, res)
    {
        super.getAll(req, res, 'year', 'month');
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

module.exports = PayrollsController;