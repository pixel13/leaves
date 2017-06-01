const DB = require('../models/DB.js');

class LeavesController
{
    getAll(req, res)
    {
        console.log("Funzione getAll!");

/*
        DB.table('leaves').insert({ day: 14, month: 2, year: 2017, hours: 8, vacation: 0 }).then(function(id) {
            console.log('Id: ' + id);
        });*/
        //DB.table('leaves').select().then(rows => { console.log(rows) });


        //console.log(DB.table('leaves').update({pippo: 'gnappo', snari: 'poponi', si: 3}).where({id: 4}).getQuery());
        //DB.table('leaves').delete().where({id: 3}).then(num => {console.log(num)});

        res.sendStatus(200);
    }

    get(req, res)
    {
        console.log("Funzione get!");
        res.sendStatus(200);
    }
}

module.exports = LeavesController;