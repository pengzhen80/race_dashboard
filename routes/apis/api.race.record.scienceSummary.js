var express = require('express');
var router = express.Router();
var model_postgres_cloud_race_reacordSummary = require('../../db/models.postgres.cloud/models.postgres.cloud.race.record.summaryFeatures');

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
    model_postgres_cloud_race_reacordSummary.searchrace(body['raceid'])
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

// router.post("/addrace", (req, res, next) => {
//     var errors = [];
//     const body = JSON.parse(req.body)
//     if (!body['raceid']) {
//         errors.push("No raceid specified");
//     }
//     if (errors.length) {
//         console.log(errors);
//         res.status(400).json({ "error": errors.join(",") });
//         return;
//     }
//     const start = Date.now();
//     console.log('starting', start);

//     let res_tracks = [];
//     model_postgres_local_racerank.searchByRaceId(body['raceid']).then(rows => {
//         //make tracks
//         InitTrackDatas(rows);
//         InitTrackRawData();
//     }).catch(err => {
//         console.log(err);
//     })

//     function InitTrackDatas(rows) {
//         for (var i = 0; i < rows.length; i++)
//         // for(var i=0;i<2;i++)
//         {
//             var track = {};
//             track['raceid'] = rows[i]['raceid'];
//             track['racerecordid'] = rows[i]['racerecordid'];
//             track['rank'] = rows[i]['rank'];
//             track['arrivingtime'] = rows[i]['arrivingtime'];
//             res_tracks.push(track);
//         }
//     }

//     function InitTrackRawData() {
//         var track_name_list = [];
//         for (var i = 0; i < res_tracks.length; i++) {
//             track_name_list.push(res_tracks[i]['name']);
//         }
//         model_race_track_rawdata.searchByGpxfilenameList(track_name_list).
//             then(rows_rawdata => {
//                 for (i = 0; i < rows_rawdata.length; i++) 
//                 {
//                     res_tracks[i]['data'] = rows_rawdata[i];
//                 }
//                 model_race_info.searchByRacename(body['racename'])
//                 .then(rows =>{
//                     var raceinfo = rows[0];
//                     res_tracks = coreFunctions.track_make_withRaceEndpoint(raceinfo,res_tracks);
//                     model_race_track_summaryFeatures.addrace(raceinfo,res_tracks)
//                     .then(res_summary =>{
//                         res.json({
//                             "message":"success",
//                         });
//                     })
//                     .catch(err_summary =>{
//                         res.json({
//                             "message":"fail",
//                             "error":err_summary
//                         });
//                     });
//                 })
//                 .catch(errs=>{
//                     console.log(errs);
//                 })
                         
//             }).
//             catch(err => {
//                 console.log(err);
//         })
//     }
// });

module.exports = router;