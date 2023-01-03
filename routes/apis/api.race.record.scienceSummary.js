var express = require('express');
var router = express.Router();
var model_postgres_local_race_reacordSummary = require('../../db/models.postgres.local/models.postgres.local.race.record.summaryFeatures');

router.post("/searchrace", (req, res, next) => {
    var errors = [];
    //check content type
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
    if (!body['raceid']) {
        errors.push("No raceid specified");
    }
    if (errors.length) {
        console.log(errors);
        res.status(400).json({ "error": errors.join(",") });
        return;
    }
    console.log(body['raceid']);
    model_postgres_local_race_reacordSummary.searchrace(body['raceid'])
        .then(rows => {
            res.json({
                'status': 'ok',
                'racerecord_sciencesummary': rows
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