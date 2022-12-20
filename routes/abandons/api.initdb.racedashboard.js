const { json } = require('express');
var express = require('express');
var router = express.Router();
var db = require("../../db/db.sqlites")

router.post("/", (req, res, next) => {
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
                makeDashboard(res_tracks);                
            } 
        )
        //timeSliecr : totaldistance / 100km : e: 200km/100km=2, times = [1h,2h]
        function makeDashboard(tracks)
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
                const timesSlicer = Math.floor(race_totaldistance/50);
                let timesSlicer_list = [];
                for(var i=1;i<timesSlicer;i++)
                {
                    var tmp_date = new Date();
                    tmp_date.setTime(raceStartTime.getTime() + i * 60 * 60 * 1000);
                    timesSlicer_list.push(tmp_date);
                }
                console.log(timesSlicer,timesSlicer_list);
                let rowsForDashboard = [];
                for(var i=0;i<tracks.length;i++)
                {
                    var rowForDashboard = {};
                    rowForDashboard['gpxfilename'] = tracks[i]['name'];
                    const[straightspeed,routeefficiency] = dashboard(tracks[i]['data']);
                    rowForDashboard['straightspeed'] = straightspeed;
                    rowForDashboard['routeefficiency'] = routeefficiency;
                    rowsForDashboard.push(rowForDashboard);
                }

                for(var i=0;i<rowsForDashboard.length;i++)
                {
                  var sql ='INSERT INTO t_race_dashboard (racename, gpxfilename, straightspeed,routeefficiency) VALUES (?,?,?,?)'
                  var params =[body['racename'],rowsForDashboard[i]['gpxfilename'], rowsForDashboard[i]['straightspeed'], rowsForDashboard[i]['routeefficiency']]
                  
                  db.run(sql, params, function (err, result) {
                      if (err){
                        //   res.status(400).json({"error": err.message})
                        //   return;
                        console.log(errors);
                      }
                      else
                      {
                        console.log(result);
                      }
                  });
                }

                function dashboard(track)
                {
                    var dash_straightSpeed = [];
                    var dash_realtimeRouteEfficiency = [];

                    var pickedPoints = [];
                    var picked_flyedDistance = [];
                    var test_picked_flyedDistance = [];
                    var total_flyDistance = 0;
                    var test_total_flyDistance = 0;
                    var picker_count = 0;
                    var picker_time = timesSlicer_list[picker_count];
                    console.log('track.length',track.length);
                    // if(track.length == 0)
                    // {
                    //     return [null,null];
                    // }
                    for(var i=1;i<track.length-1;i++)
                    {
                        var curTime = new Date(track[i]['time']);
    
                        var curPoint = turf.point([track[i]['lon'], track[i]['lat']]);
                        var lastPoint =  turf.point([track[i-1]['lon'], track[i-1]['lat']]);
                        var distance = track[i]['distance'];
                        total_flyDistance+=distance;
                        // var dis = turf.distance(lastPoint,curPoint);
                        // test_total_flyDistance+= dis*1000;
                        // console.log(distance - dis*1000);
                        // console.log()
                        if(curTime == picker_time)
                        {
                            console.log(curTime,picker_time,(total_flyDistance/1000).toFixed(3));
                            pickedPoints.push(track[i]);
                            picked_flyedDistance.push(total_flyDistance);
                            picker_count++;
                            if(picker_count == timesSlicer_list.length)
                            {
                                break;
                            }
                            picker_time = timesSlicer_list[picker_count];
                        }
                        else
                        {
                            var nextTime = new Date(track[i+1]['time']);
                            if(curTime < picker_time && nextTime> picker_time)
                            {
                                // console.log(curTime,picker_time,(total_flyDistance/1000).toFixed(3));
                                // console.log(curTime,nextTime,picker_time);
                                var cur_dif = picker_time - curTime;
                                var next_dif = picker_time - nextTime;
                                if(cur_dif<next_dif)
                                {
                                    pickedPoints.push(track[i]);
                                    picked_flyedDistance.push(total_flyDistance);
                                    picker_count++;
                                    if(picker_count == timesSlicer_list.length)
                                    {
                                        break;
                                    }
                                    picker_time = timesSlicer_list[picker_count];
                                }
                                else
                                {
                                    pickedPoints.push(track[i+1]);
                                    var next_distance = track[i+1]['distance'];
                                    picked_flyedDistance.push((total_flyDistance+next_distance));
                                    picker_count++;
                                    if(picker_count == timesSlicer_list.length)
                                    {
                                        break;
                                    }
                                    picker_time = timesSlicer_list[picker_count];
                                }
                            }
                        }
                    }
                    // console.log(pickedPoints.length);
                    // console.log(test_total_flyDistance,total_flyDistance);
                    //get dashboard datas
                    for(var i=0;i<pickedPoints.length;i++)
                    {
                        var curPoint = pickedPoints[i];
                        curPoint = turf.point([curPoint['lon'], curPoint['lat']]);
                        var leftdistance = turf.distance(curPoint,raceEndPoint);
                        var testdistance = turf.distance(curPoint,raceStartPoint);

                        var curTime = new Date(pickedPoints[i]['time']);
                        var time_diff = curTime.getTime() - raceStartTime.getTime();
                        // console.log(time_diff);
                        time_diff = (time_diff/1000)/3600;
                        var straightspeed = (race_totaldistance-leftdistance)/time_diff;
                        // console.log(picked_flyedDistance[i]/1000);
                        var realtime_routeEff = (race_totaldistance-leftdistance)/(picked_flyedDistance[i]/1000);

                        dash_straightSpeed.push(straightspeed.toFixed(3));
                        dash_realtimeRouteEfficiency.push(realtime_routeEff.toFixed(3));
                    }
                    // console.log(dash_straightSpeed.length,dash_realtimeRouteEfficiency.length);
                    //trans array to string with ','
                    var str_dash_straightSpeed = '';
                    var str_dash_realtimeRouteEfficiency = '';
                    for(var i=0;i<dash_straightSpeed.length-1;i++)
                    {
                        str_dash_straightSpeed += (dash_straightSpeed[i].toString()+',');
                        str_dash_realtimeRouteEfficiency += (dash_realtimeRouteEfficiency[i].toString()+',')
                    }
                    if(dash_straightSpeed.length>1)
                    {
                        str_dash_straightSpeed += dash_straightSpeed[dash_straightSpeed.length-1].toString();
                        str_dash_realtimeRouteEfficiency += dash_realtimeRouteEfficiency[dash_realtimeRouteEfficiency.length-1].toString();
                    }
                    console.log(dash_realtimeRouteEfficiency);
                    return [str_dash_straightSpeed,str_dash_realtimeRouteEfficiency];
                }
              });

        }
    }
});

module.exports = router;