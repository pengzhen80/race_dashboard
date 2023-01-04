const { json } = require('express');
var express = require('express');
var router = express.Router();
var db = require("../../db/clients/db.sqlites")

// var bodyParser = require("body-parser");
// router.use(bodyParser.urlencoded({ extended: false }));
// router.use(bodyParser.json());
router.post("/", (req, res, next) => {
    var errors=[];
    // console.log('req',req.params);
    // console.log('Body: ', req.body,typeof(req.body));
    // console.log('racename',req.body['racename']);
    try{
        JSON.parse(req.body);
    }catch(err)
    {
        console.log("can not parser body");
        res.json({
           "message":"wrong content type",
        })
    }
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
    var sql = "select rank, gpxfilename,arrivingtime from t_race_rank where racename = ? and rank<11 order by rank"
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
            // gpxfilename text, 
            // count int,
            // lat text,
            // lon text,
            // fix text,
            // time text,
            // ele REAL,
            // speed REAL,
            // heading REAL,
            // distance REAL
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

                var sql = "select racename, start_lat, start_lon,end_lat,end_lon,starttime from t_race_info where racename = ?"
                var params = [body['racename']]
                db.all(sql, params, (err, rows) => {
                    if (err) {
                      console.log(err);
                    }
                    res.json({
                        // "message":"success",
                        "raceinfo":rows,
                        'tracks':res_tracks
                    })
                });
                // res.json({
                //     // "message":"success",
                //     "data":res_tracks
                // })
            } 
        )
    }
});

module.exports = router;