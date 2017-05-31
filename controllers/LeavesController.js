class LeavesController
{
    getAll(req, res)
    {
        console.log("Funzione getAll!");
        res.sendStatus(200);
    }

    addLeave(req, res)
    {
        console.log("Funzione addLeave!");
        res.sendStatus(201);
    }
}

module.exports = LeavesController;