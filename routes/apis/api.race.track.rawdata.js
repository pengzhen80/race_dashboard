var express = require('express');
var router = express.Router();
var model_postgres_cloud_raceTrackRawdata = require('../../db/models.postgres.cloud/models.postgres.cloud.race.track.rawdata');
var model_postgres_cloud_racerank = require('../../db/models.postgres.cloud/models.postgres.cloud.race.rank');

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
    model_postgres_cloud_raceTrackRawdata.searchByRaceRecordId(body['racerecordid'])
        .then(rows => {
            res.json({
                'status': 'ok',
                'trackrawdata': rows
            });
        })
        .catch(err => {
            console.log(err);
            res.json({
                'status': 'failed'
            });
        })
});


router.post("/searchByRaceId", (req, res, next) => {
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
    if (!body['raceid']) {
        errors.push("No ']) specified");
    }
    if (errors.length) {
        console.log(errors);
        res.status(400).json({ "error": errors.join(",") });
        return;
    }
    console.log(body['raceid']);
    //get all ranked racerecords
    model_postgres_cloud_racerank.searchByRaceId_limitbyrank(body['raceid'],100)
        .then(rows => {
            var racerecordlist = [];
            for(var i=0;i<rows.length;i++)
            {
                racerecordlist.push(rows[i]['racerecordid']);
            }
            console.log('racerecordlist : ',racerecordlist.length);
            model_postgres_cloud_raceTrackRawdata.searchByRaceRecordIdList_optimize(racerecordlist)
            .then(res_trackrawdata =>{
                res.json({
                    'status': 'success',
                    'message':res_trackrawdata
                });
            })
            .catch(err_trackrawdata =>{
                console.log(err_trackrawdata);
                res.json({
                    'status': 'failed',
                    'message':err_trackrawdata
                });
            });
        })
        .catch(err => {
            console.log(err);
            res.json({
                'status': 'failed',
                'message':err
            });
        })
});

module.exports = router;