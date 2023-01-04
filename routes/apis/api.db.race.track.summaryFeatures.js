const { json } = require('express');
var express = require('express');
const { OK } = require('sqlite3');
var router = express.Router();
var model_race_track_summaryFeatures = require('../../db/models_sqlites/models.sqlites.race.track.summaryFeatures');
var model_race_rank = require('../../db/models_sqlites/models.sqlites.race.rank');
var model_race_track_rawdata = require('../../db/models_sqlites/models.sqlites.race.gpxfiles.rows');
var model_race_info = require('../../db/models_sqlites/models.sqlites.race.info');
var coreFunctions = require("../../core/gps_track_sciencefeatures");

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
    if (!body['racename']) {
        errors.push("No racename specified");
    }
    if (errors.length) {
        console.log(errors);
        res.status(400).json({ "error": errors.join(",") });
        return;
    }
    console.log(body['racename']);
    model_race_track_summaryFeatures.searchrace(body['racename'])
        .then(rows => {
            // var normalize_row_list = [];
            // for (var i = 0; i < rows.length; i++) {
            //     // {
            //     //     "id": 5,
            //     //     "racename": "唐山尼尔森赛鸽公棚-2022决赛",
            //     //     "gpxfilename": "03-1899519",
            //     //     "straightspeed": 48.152,
            //     //     "realspeed": 50.619,
            //     //     "realdistance": 550.088,
            //     //     "avgelevation": 49.713,
            //     //     "routeefficiency": 0.951
            //     // },
            //     delete rows[i]["id"];
            //     normalize_row_list.push(rows[i]);
            // }
            res.json({
                'status': 'ok',
                'race_track_summaryFeatures': rows
            });
        })
        .catch(err => {
            console.log(err);
            res.json({
                'status': 'failed'
            });
        })
});

router.post("/deleterace", (req, res, next) => {
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
    if (!body['racename']) {
        errors.push("No racename specified");
    }
    if (errors.length) {
        console.log(errors);
        res.status(400).json({ "error": errors.join(",") });
        return;
    }
    console.log(body['racename']);
    model_race_track_summaryFeatures.deleterace(body['racename'])
        .then(rows => {
            res.json({
                'status': 'success',
            });
        })
        .catch(err => {
            console.log(err);
            res.json({
                'status': 'failed'
            });
        })
});

router.post("/addrace", (req, res, next) => {
    var errors = [];
    // console.log('req',req.params);
    // console.log('Body: ', req.body,typeof(req.body));
    // console.log('racename',req.body['racename']);
    const body = JSON.parse(req.body)
    if (!body['racename']) {
        errors.push("No racename specified");
    }
    if (errors.length) {
        console.log(errors);
        res.status(400).json({ "error": errors.join(",") });
        return;
    }
    const start = Date.now();
    console.log('starting', start);

    let res_tracks = [];
    model_race_rank.searchByRacename(body['racename']).then(rows => {
        //make tracks
        InitTrackDatas(rows);
        InitTrackRawData();
    }).catch(err => {
        console.log(err);
    })

    function InitTrackDatas(rows) {
        for (var i = 0; i < rows.length; i++)
        // for(var i=0;i<2;i++)
        {
            var track = {};
            track['name'] = rows[i]['gpxfilename'];
            track['rank'] = rows[i]['rank'];
            track['arrivingtime'] = rows[i]['arrivingtime'];
            res_tracks.push(track);
        }
    }

    function InitTrackRawData() {
        var track_name_list = [];
        for (var i = 0; i < res_tracks.length; i++) {
            track_name_list.push(res_tracks[i]['name']);
        }
        model_race_track_rawdata.searchByGpxfilenameList(track_name_list).
            then(rows_rawdata => {
                for (i = 0; i < rows_rawdata.length; i++) 
                {
                    res_tracks[i]['data'] = rows_rawdata[i];
                }
                model_race_info.searchByRacename(body['racename'])
                .then(rows =>{
                    var raceinfo = rows[0];
                    res_tracks = coreFunctions.track_make_withRaceEndpoint(raceinfo,res_tracks);
                    model_race_track_summaryFeatures.addrace(raceinfo,res_tracks)
                    .then(res_summary =>{
                        res.json({
                            "message":"success",
                        });
                    })
                    .catch(err_summary =>{
                        res.json({
                            "message":"fail",
                            "error":err_summary
                        });
                    });
                })
                .catch(errs=>{
                    console.log(errs);
                })
                         
            }).
            catch(err => {
                console.log(err);
        })
    }
});

module.exports = router;