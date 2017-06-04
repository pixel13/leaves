const DB = require('../library/DB.js');

class RestController
{
    constructor(table)
    {
        this.table = table;
    }

    getAll(req, res, ...orderBy)
    {
        var statement = DB.table(this.table).select();

        if (orderBy.length > 0)
            statement.orderBy(orderBy.join(','));

        statement.then(rows => {
            res.status(200).send(rows);
        });
    }

    get(req, res)
    {
        DB.table(this.table).select().where({id: req.params.id}).then(rows => {
            if (rows.length === 0)
            {
                res.sendStatus(404);
            }
            else
            {
                res.status(200).send(rows[0]);
            }
        });
    }

    post(req, res)
    {
        var object = req.body;

        DB.table(this.table).insert(object).then(result => {
            if (this._isError(result))
                return res.status(400).send(result);

            object.id = result;
            res.status(201).send(object);
        });
    }

    put(req, res)
    {
        var changes = req.body;

        DB.table(this.table).update(changes).where({id: req.params.id}).then(result => {
            if (this._isError(result))
                return res.status(400).send(result);

            res.sendStatus(200);
        });
    }

    delete(req, res)
    {
        DB.table(this.table).delete().where({id: req.params.id}).then(result => {
            res.sendStatus(200);
        });
    }

    _isError(variable)
    {
        return (typeof variable === 'string');
    }
}

module.exports = RestController;