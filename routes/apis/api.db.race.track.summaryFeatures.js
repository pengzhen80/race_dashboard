const { json } = require('express');
var express = require('express');
const { OK } = require('sqlite3');
var router = express.Router();
var db = require("../../db/db.sqlites")
var model_race_track_summaryFeatures = require('../../db/models_sqlites/models.sqlites.race.track.summaryFeatures');

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
    console.log('starting' ,start);

    let res_tracks = [];
    var sql = "select rank, gpxfilename,arrivingtime from t_race_rank where racename = ? order by rank"
    var params = [body['racename']]
    // console.log(params);
    db.all(sql, params, (err, rows) => {
        if (err) {
            console.log(err);
        //   res.status(400).json({"error":err.message});
        //   return;
        }
        //make tracks
        InitTrackDatas(rows);
        InitTrackRawData();
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
        function getTrackRawData(trackIndex)
        {
            var trackname = res_tracks[trackIndex]['name'];
            var sql = "SELECT count,lat,lon,ele,speed,distance,time,heading from t_race_gpxfiles_rows where gpxfilename =? ORDER by count;";
            var params = [trackname];
                // console.log(params);
            return new Promise(function(resolve,reject){
                    db.all(sql, params, (err, rows) => {
                    // res_tracks[trackIndex]['data'] = rows;
                    resolve(rows);
                });
            })
        }

        //make functions to promise
        var function_list = [];
        for(var i=0;i<res_tracks.length;i++)
        {
            function_list.push(getTrackRawData(i));
        }

        Promise.all(function_list)
        .then(
            values => {
                for(i=0;i<values.length;i++)
                {
                    res_tracks[i]['data'] = values[i];
                }
                const end = Date.now();
                console.log('time need(s):' ,(end-start)/1000);
                makeSummaryFeatures(res_tracks);                
            } 
        )
        //timeSliecr : totaldistance / 100km : e: 200km/100km=2, times = [1h,2h]
        function makeSummaryFeatures(tracks)
        {
            //get race info 
            var sql = "select racename, start_lat, start_lon,end_lat,end_lon,starttime from t_race_info where racename = ?"
            var params = [body['racename']]
            db.all(sql, params, (err, rows) => {
                if (err) {
                  console.log(err);
                  return;
                }

                //get totaldistance
                const turf = require('@turf/turf');
                const raceinfo = rows[0];
                var raceStartPoint = turf.point([raceinfo['start_lon'], raceinfo['start_lat']]);
                var raceEndPoint = turf.point([raceinfo['end_lon'], raceinfo['end_lat']]);
                var race_totaldistance = turf.distance(raceStartPoint,raceEndPoint);    

                //timeslicerlist 
                const raceStartTime = new Date(raceinfo['starttime']);
                console.log(race_totaldistance);
                let rowForDashboard_list = [];
                for(var i=0;i<tracks.length;i++)
                {
                    var rowForDashboard = {};
                    rowForDashboard['racename'] = body['racename'];
                    rowForDashboard['gpxfilename'] = tracks[i]['name'];
                    const[res_straightspeed,res_realspeed,res_realdistance,res_avgelevation,res_routeefficiency] = summaryFeatures(tracks[i]['arrivingtime'],tracks[i]['data']);
                    rowForDashboard['straightspeed'] = res_straightspeed;
                    rowForDashboard['realspeed'] = res_realspeed;
                    rowForDashboard['realdistance'] = res_realdistance;
                    rowForDashboard['avgelevation'] = res_avgelevation;
                    rowForDashboard['routeefficiency'] = res_routeefficiency;
                    rowForDashboard_list.push(rowForDashboard);
                }

                //make promise all
                var function_list = [];
                for(var i=0;i<rowForDashboard_list.length;i++)
                {
                    function_list.push(model_race_track_summaryFeatures.insert(rowForDashboard_list[i]));
                }
                try
                {
                    Promise.all(function_list)
                    .then(
                    values => {
                        var errList = [];
                        for(var i=0;i<values.length;i++)
                        {
                            if(values[i])
                            {
                                errList.push(values[i]);
                            }
                        }
                        console.log(errList);
                        res.json({
                            "message":"success",
                        })
                    } 
                )
                }
                catch(err)
                {
                    console.log(err);
                    res.json({
                        "message":err,
                    })
                }
                

                function summaryFeatures(arrivingtime,track)
                {
                    var res_straightspeed;
                    var res_realspeed;
                    var res_realdistance = 0;
                    var res_avgelevation;
                    var res_routeefficiency;
                    //get real total distance
                    var totalelevation = 0;
                    for(var i=0;i<track.length;i++)
                    {
                        var distance = (track[i]['distance']/1000);
                        res_realdistance+=distance;
                        totalelevation += track[i]['ele'];
                    }
                    //get time
                    var endTime = new Date(arrivingtime);
                    var timeSpend = (endTime.getTime() - raceStartTime.getTime())/(1000*3600);
                    //get straight speed
                    try
                    {
                        res_straightspeed = race_totaldistance/timeSpend;
                    }
                    catch(err)
                    {
                        console.log(err);
                        res_straightspeed = 0;
                    }
                    //get res_realspeed
                    try
                    {
                        res_realspeed = res_realdistance/timeSpend;
                    }
                    catch(err)
                    {
                        console.log(err);
                        res_realspeed = 0;
                    }
                    //get res_avgelevation
                    try
                    {
                        res_avgelevation = totalelevation/track.length;
                    }
                    catch(err)
                    {
                        console.log(err);
                        res_avgelevation = 0;
                    }
                    //get res_routeefficiency
                    try
                    {
                        res_routeefficiency = race_totaldistance/res_realdistance;
                    }
                    catch(err)
                    {
                        console.log(err);
                        res_routeefficiency = 0;
                    }
                    // console.log([res_straightspeed,res_realspeed,res_realdistance,res_avgelevation,res_routeefficiency]);
                    return [res_straightspeed.toFixed(3),res_realspeed.toFixed(3),res_realdistance.toFixed(3),res_avgelevation.toFixed(3),res_routeefficiency.toFixed(3)];
                }
              });

        }
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
    model_race_track_summaryFeatures.searchrace(body['racename'])
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