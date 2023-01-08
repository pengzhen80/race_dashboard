var sqlite3 = require('sqlite3').verbose()
// var md5 = require('md5')
// const fs = require('fs');

const DBSOURCE = "db/dbsource_public/db.sqlite"

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
      // Cannot open database
      console.error(err.message)
      throw err
    }else{
        console.log('Connected to the SQLite database.')
        db.run(`CREATE TABLE t_race_gpxfiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            racename text, 
            area text, 
            gpxfilename text, 
            gpxfilepath text
            )`,
        (err) => {
            if (err) {
                // Table already created
            }else{
                // Table just created, creating some rows
                var insert = 'INSERT INTO t_race_gpxfiles (racename, area, gpxfilename,gpxfilepath) VALUES (?,?,?,?)'
                db.run(insert, ["唐山尼尔森赛鸽公棚-2022决赛-test","china",'01-0001309','./test'])
            }
        });  
        db.run(`CREATE TABLE t_race_rank (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            racename text, 
            rank int, 
            gpxfilename text, 
            arrivingtime text
            )`,
        (err) => {
            if (err) {
                // Table already created
            }else{
                // Table just created, creating some rows
                var insert = 'INSERT INTO t_race_rank (racename, rank, gpxfilename,arrivingtime) VALUES (?,?,?,?)'
                db.run(insert, ["唐山尼尔森赛鸽公棚-2022决赛-test","1",'01-0001309','20221213 11:39:00'])
            }
        });  
        db.run(`CREATE TABLE t_race_gpxfiles_rows (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            gpxfilename text, 
            count int,
            lat text,
            lon text,
            fix text,
            time text,
            ele REAL,
            speed REAL,
            heading REAL,
            distance REAL
            )`,
        (err) => {
            if (err) {
                // Table already created
            }else{
               console.log('create gpx table success');
            }
        });  

        db.run(`CREATE INDEX idx_t_race_gpxfiles_rows_gpxfilename ON t_race_gpxfiles_rows (gpxfilename)`,
        (err) => {
            if (err) {
                // console.log(err)
            }else{
               console.log('create idx_t_race_gpxfiles_rows_gpxfilename success');
            }
        });  

        db.run(`CREATE TABLE t_race_info (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            racename text, 
            start_lat real,
            start_lon real,
            end_lat real,
            end_lon real,
            starttime text
            )`,
        (err) => {
            if (err) {
                // Table already created
            }else{
               console.log('create raceinfo success');
               var insert = 'INSERT INTO t_race_info (racename, start_lat, start_lon,end_lat,end_lon,starttime) VALUES (?,?,?,?,?,?)'
               db.run(insert, ["唐山尼尔森赛鸽公棚-2022决赛",42.20392,123.25294,39.51670,118.14257,'2022-05-21 05:08:00'])
            }
        });  

        db.run(`CREATE TABLE t_race_dashboard (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            racename text, 
            gpxfilename text,
            straightspeed text,
            routeefficiency text
            )`,
        (err) => {
            if (err) {
                // Table already created
            }else{
               console.log('create t_race_dashboard success');
            }
        });  

        db.run(`CREATE TABLE t_race_track_summaryFeatures (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            racename text, 
            gpxfilename text,
            straightspeed real,
            realspeed real,
            realdistance real,
            avgelevation real,
            routeefficiency real
            )`,
        (err) => {
            if (err) {
                // Table already created
            }else{
               console.log('create t_race_track_summaryFeatures success');
            }
        });  

        db.run(`CREATE TABLE t_race_tracks_routeSimilarity (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            racename text, 
            gpxfilename_base text,
            gpxfilename_comparator text,
            avg_track_distance real
            )`,
        (err) => {
            if (err) {
                // Table already created
            }else{
               console.log('create t_race_track_sumt_race_tracks_routeSimilaritymaryFeatures success');
            }
        });  
    }
});


module.exports = db