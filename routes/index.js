var express = require('express');
var router = express.Router();
var db = require("../db/clients/db.sqlites")
const fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// router.get("/initdb/", (req, res, next) => {
//   var sql = "select * from t_race_rank"
//   var params = []
//   db.all(sql, params, (err, rows) => {
//       if (err) {
//         res.status(400).json({"error":err.message});
//         return;
//       }
//       res.json({
//           "message":"success",
//           "data":rows
//       })
//   });
//   // fs.readFile('./public/ranks/唐山尼尔森赛鸽公棚-2022决赛.txt', 'utf8', (err, data) => {
//   //           if (err) {
//   //             console.error(err);
//   //             return;
//   //           }
//   //           console.log(data.length);
//   //           const ranklist = data.split('\n');
//   //           // console.log(words.length);
//   //           // console.log(words[0]);
//   //           // console.log(words[words.length-1]);
//   //           ranklist.splice(-1);
//   //           // console.log(words[words.length-1]);
//   //           for(var i=0;i<ranklist.length;i++)
//   //           {
//   //               var rank_ele_list = ranklist[i].split(';'); 
//   //               rank_ele_list[2] = rank_ele_list[2].replace(/(\r\n|\n|\r)/gm, "");
//   //               if(rank_ele_list.length<3)
//   //               {
//   //                 console.log(rank_ele_list);
//   //               }
//   //               var insert = 'INSERT INTO t_race_rank (racename, rank, gpxfilename,arrivingtime) VALUES (?,?,?,?)'
//   //               db.run(insert, ["唐山尼尔森赛鸽公棚-2022决赛",rank_ele_list[0],rank_ele_list[1],rank_ele_list[2]], (err) => {
//   //                 console.log(err);
//   //               })
//   //           }
//   // });
// });

// router.get("/clearrank/", (req, res, next) => {
//   var sql = "delete from t_race_rank"
//   var params = []
//   db.all(sql, params, (err, rows) => {
//       if (err) {
//         res.status(400).json({"error":err.message});
//         return;
//       }
//       res.json({
//           "message":"success",
//           "data":rows
//       })
//   });
// });

// router.get("/cleargpxfiles/", (req, res, next) => {
//   var sql = "delete from t_race_gpxfiles"
//   var params = []
//   db.all(sql, params, (err, rows) => {
//       if (err) {
//         res.status(400).json({"error":err.message});
//         return;
//       }
//       res.json({
//           "message":"success",
//           "data":rows
//       })
//   });
// });

// router.get("/clearrawdata/", (req, res, next) => {
//   var sql = "delete from t_race_gpxfiles_rows"
//   var params = []
//   db.all(sql, params, (err, rows) => {
//       if (err) {
//         res.status(400).json({"error":err.message});
//         return;
//       }
//       res.json({
//           "message":"success",
//           "data":rows
//       })
//   });
// });

var bodyParser = require("body-parser");
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
router.post("/initdb_t_race_gpxfiles/", (req, res, next) => {
    var errors=[]
    if (!req.body.path){
        errors.push("No path specified");
    }
    // if (!req.body.path){
    //     errors.push("No path specified");
    // }
    if (errors.length){
        res.status(400).json({"error":errors.join(",")});
        return;
    }
    var data = {
      path: req.body.path,
    }
    var filenames = readfileNames();
    function readfileNames()
    {
      var result_filenames = [];
      result_filenames = fs.readdirSync('./public/gpxfiles/'+data.path);
      return result_filenames;
    }
    let count_success = 0;
    for(var i=0;i<filenames.length;i++)
    {
      var normalize_filename = filenames[i].split('.')[0];
      var sql ='INSERT INTO t_race_gpxfiles (racename, area, gpxfilename,gpxfilepath) VALUES (?,?,?,?)'
      var params =[data.path, 'china', normalize_filename,data.path]
      
      db.run(sql, params, function (err, result) {
          if (err){
              res.status(400).json({"error": err.message})
              return;
          }
          else
          {
            console.log(result);
          }
      });
    }
    res.json({
      "message": "success",
      "data": count_success,
  })
})

module.exports = router;
