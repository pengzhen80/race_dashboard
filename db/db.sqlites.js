var sqlite3 = require('sqlite3').verbose()
// var md5 = require('md5')
// const fs = require('fs');

const DBSOURCE = "db.sqlite"

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
    }
});


module.exports = db