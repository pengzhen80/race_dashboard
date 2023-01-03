var express = require('express');
var router = express.Router();
var model_race_rank = require('../../db/models_sqlites/models.sqlites.race.rank');
var model_race_gpxfiles_rows = require('../../db/models_sqlites/models.sqlites.race.gpxfiles.rows');
var model_race_tracks_routeSimilarity = require('../../db/models_sqlites/models.sqlites.race.tracks.routeSimilarity');
var model_race_track_summaryfeatures= require('../../db/models_sqlites/models.sqlites.race.track.summaryFeatures');

router.post("/addrace", (req, res, next) => {
    var errors=[];
    // console.log('req',req.params);
    // console.log('Body: ', req.body,typeof(req.body));
    // console.log('racename',req.body['racename']);
    const body =  JSON.parse(req.body)
    if (!body['racename']){
        errors.push("No racename specified");
    }
    if (errors.length){
        console.log(errors);
        res.status(400).json({"error":errors.join(",")});
        return;
    }
    const start = Date.now();

    let res_tracks = [];
    model_race_rank.searchByRacename_rankLimit(body['racename'],101)
    .then(rows =>{
        InitTrackDatas(rows);
        InitTrackRawData();
    })
    .catch(errs=>{
        console.log(errs);
    });
    
    function InitTrackDatas(rows)
    {
        for(var i=0;i<rows.length;i++)
        // for(var i=0;i<2;i++)
        {
              var track = {};
              track['name'] = rows[i]['gpxfilename'];
              track['rank'] = rows[i]['rank'];
              track['arrivingtime'] = rows[i]['arrivingtime'];
              res_tracks.push(track);
          }
    }

    function InitTrackRawData()
    {
        var trackName_list = [];
        for(var i=0;i<res_tracks.length;i++)
        {
            trackName_list.push(res_tracks[i]['name']);
        }
        model_race_gpxfiles_rows.searchByGpxfilenameList(trackName_list)
        .then(values => {
            for(i=0;i<values.length;i++)
            {
                res_tracks[i]['data'] = values[i];
            }

            model_race_tracks_routeSimilarity.insertrace(body['racename'],res_tracks)
            .then(rows => {
                const end = Date.now();
                console.log('time need(s):' ,(end-start)/1000);
                res.json({
                    'status':'ok',
                });
            })
            .catch(errs => {
                const end = Date.now();
                console.log('time need(s):' ,(end-start)/1000);
                res.json({
                    'status':'fail',
                    'message':errs
                });
            });    
        })
        .catch(errs => {
            console.log(errs);
        });
    }
});

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
    model_race_tracks_routeSimilarity.searchrace(body['racename'])
    .then(rows => {
        //get all track realspeed and rank 
        var track_name_list = [];
        for(var i=0;i<rows.length;i++)
        {
            var gpxfilename_base = rows[i]['gpxfilename_base'];
            var gpxfilename_comparator = rows[i]['gpxfilename_comparator'];
            if(!track_name_list.includes(gpxfilename_base))
            {
                track_name_list.push(gpxfilename_base);
            }
            if(!track_name_list.includes(gpxfilename_comparator))
            {
                track_name_list.push(gpxfilename_comparator);
            }
        }
       
        model_race_rank.searchByGpxfilenameList(track_name_list)
        .then(rows_ranks=>{
            model_race_track_summaryfeatures.searchByGpxfilenameList(track_name_list)
            .then(rows_summary=>{
                var res_trackInfo_list = [];
                
                for(var i=0;i<track_name_list.length;i++)
                {
                    var res_trackInfo = {};
                    res_trackInfo['trackname'] = track_name_list[i];
                    res_trackInfo['rank'] = rows_ranks[i][0]['rank'];
                    res_trackInfo['realspeed'] = rows_summary[i][0]['realspeed'];
                    res_trackInfo_list.push(res_trackInfo);
                }
                console.log(rows_ranks);
                console.log(res_trackInfo_list);
                res.json({
                    'status':'ok',
                    'trackinfo':res_trackInfo_list,
                    'race_tracks_routeSimilarity':rows
                });
            })
            .catch(err_summary=>{
                console.log(err_summary);
                res.json({
                    'status':'fail',
                    'message':err_summary
                });
            })
        })
        .catch(err_ranks=>{
            console.log(err_ranks);
            res.json({
                'status':'fail',
                'message':err_ranks
            });
        })
        

        // res.json({
        //     'status':'ok',
        //     'race_tracks_routeSimilarity':rows
        // });
    })
    .catch(err=> {
        console.log(err);
        res.json({
            'status':'failed'
        });
    })
});

module.exports = router;