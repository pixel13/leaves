/**
 * Simple object-oriented interface for a MySQL database
 *
 * It is a wrapper around npm mysql module
 *
 * The 4 fundamental queries can be done in this way:
 * - INSERT: DB.table(<NAME>).insert(<OBJECT>)
 * - UPDATE: DB.table(<NAME>).update(<OBJECT>)[.where(<CONDITIONS>)]
 * - SELECT: DB.table(<NAME>).select([<FIELDS>])[.where(<CONDITIONS>)][.orderBy(<CRITERIA>)|.reverseOrderBy(<CRITERIA>)]
 * - DELETE: DB.table(<NAME>).delete()[.where(<CONDITIONS>)]
 *
 * To get the querystring corresponding to the object, just append to the query the method: getQuery()
 * The execution of the query is asyncronous, so to execute one of the above, it must be appended the method: then(<CALLBACK>)
 * The callback should take one parameter that will be filled:
 * - With the id of the inserted row, if it's an INSERT statement
 * - With the number of changed rows if it's an UPDATE statement
 * - With the resultset if it's a SELECT statement
 * - With the number of deleted rows if it's a DELETE statement
 *
 * Some more note:
 * - Both the <FIELDS> and <CRITERIA> can be a single string or multiple strings; in any case it will be created a comma separated list
 * - The <FIELDS> in the select() method is optional, if not specified it will be selected everything (SELECT *)
 * - In this simplified version, the <CONDITIONS> to build the WHERE clause can only be built using the = and AND operators, starting from an object:
 *      .where({field1: value1, field2: value2})    is equal to     WHERE field1='value1' AND field2='value2'
 */

const mysql = require('mysql');
const config = require('../config/config.json');

var connection = mysql.createConnection(config.db);

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

            if (err) {
                callback(err.message);
                return;
            }

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

class DB
{
    static table(name)
    {
        return new Table(name);
    }
}

module.exports = DB;

