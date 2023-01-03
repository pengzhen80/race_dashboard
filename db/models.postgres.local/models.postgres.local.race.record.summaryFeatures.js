var pg_client = require("../db.cloud.local")
var coreFunctions = require("../../core/gps_track_sciencefeatures");

module.exports.searchrace = function (raceid) {
    console.log(raceid,typeof(raceid));
    var sql = "select racerecordid,raceid,straightdistance,straightspeed,realdistance,realspeed from cloudracerecord where raceid = $1 and straightdistance IS NOT NULL and straightspeed IS NOT NULL and realdistance IS NOT NULL and realspeed IS NOT NULL";
    var params = [raceid];

    return new Promise(function (resolve, reject) {
        pg_client.query(sql, params, (err,res) => {
            console.log(res,err);
            if(err)
            {
                reject(err);
            }
            else
            {
                res = coreFunctions.science_race_recordSummary_addRouteEfficiency(res);
                resolve(res);
            }
        });
    });

};
