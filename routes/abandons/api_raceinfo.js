var express = require('express');
var router = express.Router();
var db = require("../../db/db.sqlites")

router.get("/", (req, res, next) => {
    var sql = "select racename, start_lat, start_lon,end_lat,end_lon,starttime from t_race_info where racename = '唐山尼尔森赛鸽公棚-2022决赛'"
    var params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          console.log(err);
          return;
        }

        res.json({
            // "message":"success",
            "data":rows
        })
    });
});

var bodyParser = require("body-parser");
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
router.post("/", (req, res, next) => {
    const body =  JSON.parse(req.body)
    var errors=[]
    if (!body['racename']){
        errors.push("No racename specified");
    }
    if (errors.length){
        res.status(400).json({"error":errors.join(",")});
        return;
    }

    var sql = "select racename, start_lat, start_lon,end_lat,end_lon,starttime from t_race_info where racename = ?"
    var params = [body['racename']]
    // console.log(params);
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }

        res.json({
            // "message":"success",
            "data":rows
        })
      });

});

module.exports = router;