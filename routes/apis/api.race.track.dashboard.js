const { json } = require('express');
var express = require('express');
var router = express.Router();
var model_race_track_dashboard = require('../../db/models_sqlites/models.sqlites.race.track.dashboard');

router.post("/searchrace", (req, res, next) =>
{
    var errors=[];
    //check content type
    try{
        JSON.parse(req.body);
    }catch(err)
    {
        console.log("can not parser body");
        res.json({
           "message":"wrong content type",
        })
    }
    //get body
    const body =  JSON.parse(req.body)
    if (!body['racename']){
        errors.push("No racename specified");
    }
    if (errors.length){
        console.log(errors);
        res.status(400).json({"error":errors.join(",")});
        return;
    }
    console.log(body['racename']);
    model_race_track_dashboard.searchrace(body['racename'])
    .then(rows => {
        res.json({
            'status':'ok',
            'race_track_summaryFeatures':rows
        });
    })
    .catch(err=> {
        console.log(err);
        res.json({
            'status':'failed'
        });
    })
});

module.exports = router;