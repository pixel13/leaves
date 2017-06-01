const mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'leaves'
});

class Command
{
    constructor(statement)
    {
        this._statement = statement;
    }

    where(conditions)
    {
        this._statement.conditions = conditions;

        return this;
    }

    orderBy(...fields)
    {
        this._statement.orderBy = fields;
        this._statement.reverseOrder = false;

        return this;
    }

    reverseOrderBy(...fields)
    {
        this._statement.orderBy = fields;
        this._statement.reverseOrder = true;

        return this;
    }

    then(callback)
    {
        var command = this._statement.command;

        connection.query(this.getQuery(), (err, rows, fields) => {

            if (err) throw err;

            switch (command)
            {
                case 'INSERT':
                    callback(rows.insertId);
                    break;

                case 'UPDATE':
                    callback(rows.changedRows);
                    break;

                case 'DELETE':
                    callback(rows.affectedRows);
                    break;

                case 'SELECT':
                    callback(rows);
                    break;

                default:
                    throw "Invalid SQL command " + command;
            }
        });
    }

    getQuery()
    {
        var conditions = this._getConditions();
        var order = this._getOrderClause();

        switch(this._statement.command)
        {
            case 'INSERT':
                var params = this._getInsertParams();
                return 'INSERT INTO ' + this._statement.table +
                        '(' + params.fields + ')' +
                        ' VALUES (' + params.values + ')';

            case 'SELECT':
                var fields = this._getSelectFields();
                return 'SELECT ' + fields +
                        ' FROM ' + this._statement.table +
                        conditions + order;

            case 'UPDATE':
                var assignments = this._getUpdateAssignments();
                return 'UPDATE ' + this._statement.table +
                        ' SET ' + assignments +
                        conditions;

            case 'DELETE':
                return 'DELETE FROM ' + this._statement.table +
                        conditions;

            default:
                throw "Invalid SQL command " + this._statement.command;
        }
    }

    _getConditions()
    {
        if (this._statement.conditions === undefined)
            return '';

        var conditions = [];
        for (let name of Object.keys(this._statement.conditions))
        {
            conditions.push(name + '=' + this._quote(this._statement.conditions[name]))
        }

        return ' WHERE ' + conditions.join(' AND ');
    }

    _getOrderClause()
    {
        if (this._statement.orderBy === undefined)
            return '';

        var clause = [];
        this._statement.orderBy.forEach(field => { clause.push(field) });

        return ' ORDER BY ' + clause.join(',') + (this._statement.reverseOrder ? ' DESC' : ' ASC');
    }

    _getSelectFields()
    {
        var fields = [];
        this._statement.object.forEach(field => { fields.push(field) });
        if (fields.length == 0)
            fields.push('*');

        return fields.join(',');
    }

    _getInsertParams()
    {
        var fields = [];
        var values = [];
        for (let name of Object.keys(this._statement.object))
        {
            fields.push(name);
            values.push(this._quote(this._statement.object[name]));
        }

        return {
            fields: fields.join(','),
            values: values.join(',')
        };
    }

    _getUpdateAssignments()
    {
        var assignments = [];
        for (let name of Object.keys(this._statement.object))
        {
            assignments.push(name + '=' + this._quote(this._statement.object[name]));
        }

        return assignments.join(',');
    }

    _quote(value)
    {
        var escaped = (typeof value === 'string') ? value.replace("'", "\\'") : value;

        return "'" + escaped + "'"
    }
}

class Table
{
    constructor(name)
    {
        this._statement = {
            table: name
        };
    }

    select(...fields)
    {
        this._statement.command = 'SELECT';
        this._statement.object = fields;

        return new Command(this._statement);
    }

    insert(object)
    {
        this._statement.command = 'INSERT';
        this._statement.object = object;

        return new Command(this._statement);
    }

    update(object)
    {
        this._statement.command = 'UPDATE';
        this._statement.object = object;

        return new Command(this._statement);
    }

    delete()
    {
        this._statement.command = 'DELETE';

        return new Command(this._statement);
    }
}

// SELECT <COSA> FROM <TABLE> WHERE <CONDITIONS> ORDER BY <ORDER>
// INSERT INTO <TABLE>(<FIELDS>) VALUES(<VALUES>)
// UPDATE <TABLE> SET <FIELD>=<VALUE>, ... WHERE <CONDITIONS>
// DELETE FROM <TABLE> WHERE <CONDITIONS>

class DB
{
    static table(name)
    {
        return new Table(name);
    }
}

module.exports = DB;

