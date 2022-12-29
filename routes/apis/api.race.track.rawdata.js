var express = require('express');
var router = express.Router();
var model_postgres_local_raceTrackRawdata = require('../../db/models.postgres.local/models.postgres.local.race.track.rawdata');

router.post("/searchByRacerecordid", (req, res, next) => {
    var errors = [];
    // check content type
    try {
        JSON.parse(req.body);
    } catch (err) {
        console.log("can not parser body");
        res.json({
            "message": "wrong content type",
        })
    }
    //get body
    const body = JSON.parse(req.body)
    if (!body['racerecordid']) {
        errors.push("No racerecordid specified");
    }
    if (errors.length) {
        console.log(errors);
        res.status(400).json({ "error": errors.join(",") });
        return;
    }
    console.log(body['racerecordid']);
    model_postgres_local_raceTrackRawdata.searchByRaceRecordId(body['racerecordid'])
        .then(rows => {
            res.json({
                'status': 'ok',
                'alltracks': rows
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