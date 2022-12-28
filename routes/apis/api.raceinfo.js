var express = require('express');
var router = express.Router();
var model_postgres_local_raceinfo = require('../../db/models.postgres.local/models.postgres.local.raceinfo');

router.get("/allrace", (req, res, next) => {
    var errors = [];
    //check content type
    // try {
    //     JSON.parse(req.body);
    // } catch (err) {
    //     console.log("can not parser body");
    //     res.json({
    //         "message": "wrong content type",
    //     })
    // }
    // //get body
    // const body = JSON.parse(req.body)
    // if (!body['racename']) {
    //     errors.push("No racename specified");
    // }
    // if (errors.length) {
    //     console.log(errors);
    //     res.status(400).json({ "error": errors.join(",") });
    //     return;
    // }
    // console.log(body['racename']);
    model_postgres_local_raceinfo.searchAllRace()
        .then(rows => {
            res.json({
                'status': 'ok',
                'allrace': rows
            });
        })
        .catch(err => {
            console.log(err);
            res.json({
                'status': 'failed'
            });
        })
});

module.exports = router;