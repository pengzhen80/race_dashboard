var express = require('express');
var router = express.Router();
var db = require("../../db/db.sqlites")
const fs = require('fs');
var DomParser = require('dom-parser');

// router.get('/', function(req, res, next) {
//     res.send('API is working properly');
// });

router.get("/gpxfiles/", (req, res, next) => {
    var sql = "select * from t_race_gpxfiles"
    var params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":rows
        })
      });
});

var bodyParser = require("body-parser");
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
router.post("/getAllTracks/", (req, res, next) => {
    var errors=[]
    if (!req.body.racename){
        errors.push("No racename specified");
    }
    if (errors.length){
        res.status(400).json({"error":errors.join(",")});
        return;
    }

    let racename =  req.body.racename;
    console.log(racename);

//step1:兩個表格聯合查詢，查詢出有排名的gpxfilename（其他是不合格的）；
    get_validfilenames(racename);
    function get_validfilenames(racename)
    {
        // var result = [];
        var sql ='SELECT gpxfilename,rank,arrivingtime from t_race_rank where racename = ?';     
        db.all(sql, [racename],(err, rows)=> {
            if (err){
                console.log(err);
            }
            else
            {
                console.log(rows.length);
                var filenames = [];
                var ranks = [];
                var arrivingtimes = [];
                for(var i=0;i<rows.length;i++)
                {
                    // console.log(rows[i],rows[i]['gpxfilename'],typeof(rows[i]));
                    filenames.push(rows[i]['gpxfilename']);
                    ranks.push(rows[i]['rank']);
                    arrivingtimes.push(rows[i]['arrivingtime']);
                }
                // result = rows;
                const start = Date.now();
                console.log('starting' ,start);
                //split length to 3
                var length = filenames.length;
               
                var tracks = read_gpxDatasByFilenames(racename,filenames);
                tracks_filterByArrivingTime();
                console.log(tracks.length,tracks[0]['data'].length);
                function tracks_filterByArrivingTime()
                {
                    // var normalize_tracks = [];
                    // console.log(typeof(tracks[0]));
                    for(var i=0;i<tracks.length;i++)
                    {   
                        var endTime = new Date(arrivingtimes[i]);
                        var newTrackData = [];
                        for(var j=0;j<tracks[i]['data'].length;j++)
                        {
                            var curTime = new Date(tracks[i]['data'][j]['time']);
                            if(curTime > endTime)
                            {
                                console.log(curTime,endTime);
                                break;
                            }
                            else
                            {
                                newTrackData.push(tracks[i]['data'][j]);
                            }
                        }
                        tracks[i]['data'] = newTrackData;
                    }
                }
                // var tracks = [];
                // for(var i=0;i<total_tracks_list.length;i++)
                // {
                //     // tracks += total_tracks_list[i];
                //     tracks.push.apply(tracks, total_tracks_list[i]);
                //     console.log(total_tracks_list[i].length,tracks.length);
                // }
                const end = Date.now();
                console.log('time need(s):' ,(end-start)/1000);

                db_storegpxrawdatas();
                function db_storegpxrawdatas()
                {
                    for(var i=0;i<tracks.length;i++)
                    {
                        var data = tracks[i]['data'];
                        var name = tracks[i]['name'];
                        var sql ='INSERT INTO t_race_gpxfiles_rows (gpxfilename, count,lat, lon,fix,time,ele,speed,heading,distance) VALUES ';
                        var params_list =[];
                        for(var j=0;j<data.length;j++)
                        {
                            var count = j;
                            var lat = data[j].lat;
                            var lon = data[j].lon;
                            var fix = data[j].fix;
                            var time = data[j].time;
                            var ele = data[j].ele;
                            var speed = data[j].speed;
                            var heading = data[j].heading;
                            var distance = data[j].distance;

                            if(j == data.length-1)
                            {
                                sql+='(?,?,?,?,?,?,?,?,?,?)';
                            }
                            else
                            {
                                sql+='(?,?,?,?,?,?,?,?,?,?),';
                            }
                            
                            params_list.push(name, count,lat, lon,fix,time,ele,speed,heading,distance);
                            
                        }
                        db.run(sql, params_list, function (err, result) {
                            if (err){
                                console.log(err);
                            }
                            else
                            {
                                console.log(result);
                            }
                        });
                       
                    }
                }

                if(tracks.length>0)
                {
                    res.json({
                        "message": "success",
                        "number": tracks.length
                    })
                }
                async function read_gpxDatasByFilenames_async(racename,filenames)
                {
                    var tracks = [];
                    var trackNames = [];
                    console.log('filenames ',filenames.length);
                    for(var i=0;i<filenames.length;i++)
                    {
                        var track = {};
                        track['name'] = filenames[i]; 
                        track['data'] = readfile('./public/gpxfiles/'+racename+'/'+filenames[i]+'.gpx');
                        
                        if(track['data'])
                        {
                            tracks.push(track);
                            trackNames.push(track['name']);
                        }
                    }

                    console.log('tracks.length',tracks.length);
                    console.log(trackNames);
                    total_tracks_list.push(tracks);
                    
                    // return [tracks,trackNames];

                    function readfile(filename)
                    {   
                        // console.log(filename);
                        var data = null;
                        var track_data = null;
                        try {
                            data = fs.readFileSync(filename, 'utf8');
                            track_data = decodePath(data);
                        }
                        catch (e) {
                            // console.log(e);
                        }
                        return track_data;
                    }

                    function decodePath(filedata) {
                        //decode path to polygon
                        // console.log(filedata[0]['data']);
                        var parser = new DomParser();
                        var trackData = [];
                        // var xmlDoc = parser.parseFromString(filedata['data'], 'text/xml');
                        var xmlDoc = parser.parseFromString(filedata, 'text/xml');
                            // console.log(xmlDoc.getElementsByTagName("title"));
                            // console.log(xmlDoc.getElementsByTagName("trkpt"));
                        var points = [];
                        var trkpts = xmlDoc.getElementsByTagName("trkpt");
                        for (var i = 0; i < trkpts.length; i++) {
                                // console.log(trkpts[i]);
                                var cell = {};
                                var lat = trkpts[i].getAttribute("lat");
                                var lon = trkpts[i].getAttribute("lon");
                                cell['lat'] = lat;
                                cell['lon'] = lon;
                                
                    
                                var fix = trkpts[i].getElementsByTagName('fix');
                                var time = trkpts[i].getElementsByTagName('time');
                                var ele = trkpts[i].getElementsByTagName('ele');
                                var speed = trkpts[i].getElementsByTagName('speed');
                                var heading = trkpts[i].getElementsByTagName('heading');
                                var distance = trkpts[i].getElementsByTagName('distance');
                                var hdop = trkpts[i].getElementsByTagName('hdop');
                                var sat = trkpts[i].getElementsByTagName('sat');
                                // console.log(attributes[0].innerHTML);
                                cell['fix'] = fix[0].innerHTML;
                                cell['time'] = time[0].innerHTML;
                                cell['ele'] = ele[0].innerHTML;
                                cell['speed'] = speed[0].innerHTML;
                                cell['heading'] = heading[0].innerHTML;
                                cell['distance'] = distance[0].innerHTML;
                                cell['hdop'] = hdop[0].innerHTML;
                                cell['sat'] = sat[0].innerHTML;
                    
                                points.push(cell);
                        }
                        // originalPaths.push({ name: paths[index]['name'], data: path });
                        trackData = points;
                        return trackData;
                    }
                }
               
            }
        });
        // console.log(result);
    }

// step2:根據gpxfilename讀取gpx數據，並打包成json格式，進行回傳；（2000多筆gpx檔案資料回傳，會不會導致響應時間過長？）
    function read_gpxDatasByFilenames(racename,filenames)
    {
        var tracks = [];

        for(var i=0;i<filenames.length;i++)
        {
            var track = {};
            track['name'] = filenames[i]; 
            track['data'] = readfile('./public/gpxfiles/'+racename+'/'+filenames[i]+'.gpx');
            
            if(track['data'])
            {
                tracks.push(track);
            }
        }

        console.log('tracks.length',tracks.length);
        return tracks;

        function readfile(filename)
        {   
            // console.log(filename);
            var data = null;
            var track_data = null;
            try {
                data = fs.readFileSync(filename, 'utf8');
                track_data = decodePath(data);
            }
            catch (e) {
                // console.log(e);
            }
            return track_data;
        }

        function decodePath(filedata) {
            //decode path to polygon
            // console.log(filedata[0]['data']);
            var parser = new DomParser();
            var trackData = [];
            // var xmlDoc = parser.parseFromString(filedata['data'], 'text/xml');
            var xmlDoc = parser.parseFromString(filedata, 'text/xml');
                // console.log(xmlDoc.getElementsByTagName("title"));
                // console.log(xmlDoc.getElementsByTagName("trkpt"));
            var points = [];
            var trkpts = xmlDoc.getElementsByTagName("trkpt");
            for (var i = 0; i < trkpts.length; i++) {
                    // console.log(trkpts[i]);
                    var cell = {};
                    var lat = trkpts[i].getAttribute("lat");
                    var lon = trkpts[i].getAttribute("lon");
                    cell['lat'] = lat;
                    cell['lon'] = lon;
                    
        
                    var fix = trkpts[i].getElementsByTagName('fix');
                    var time = trkpts[i].getElementsByTagName('time');
                    var ele = trkpts[i].getElementsByTagName('ele');
                    var speed = trkpts[i].getElementsByTagName('speed');
                    var heading = trkpts[i].getElementsByTagName('heading');
                    var distance = trkpts[i].getElementsByTagName('distance');
                    var hdop = trkpts[i].getElementsByTagName('hdop');
                    var sat = trkpts[i].getElementsByTagName('sat');
                    // console.log(attributes[0].innerHTML);
                    cell['fix'] = fix[0].innerHTML;
                    cell['time'] = time[0].innerHTML;
                    cell['ele'] = ele[0].innerHTML;
                    cell['speed'] = speed[0].innerHTML;
                    cell['heading'] = heading[0].innerHTML;
                    cell['distance'] = distance[0].innerHTML;
                    cell['hdop'] = hdop[0].innerHTML;
                    cell['sat'] = sat[0].innerHTML;
        
                    points.push(cell);
            }
            // originalPaths.push({ name: paths[index]['name'], data: path });
            trackData = points;
            return trackData;
        }
    }

})

module.exports = router;