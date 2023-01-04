var pg_client = require("../clients/db.cloud")
var coreFunctions = require("../../core/gps_track_sciencefeatures");
// var hashlib = require("hashlib");

module.exports.searchrace = function (raceid) {
    console.log(raceid,typeof(raceid));
    var sql = "select racerecordid,raceid,straightdistance,straightspeed,realdistance,realspeed from cloudracecertificate where raceid = $1 and straightdistance IS NOT NULL and straightspeed IS NOT NULL and realdistance IS NOT NULL and realspeed IS NOT NULL";
    var params = [raceid];

    return new Promise(function (resolve, reject) {
        pg_client.query(sql, params, (err,res) => {
            // console.log(res,err);
            if(err)
            {
                reject(err);
            }
            else
            {
                console.log(res['rows'].length);
                res = coreFunctions.science_race_recordSummary_addRouteEfficiency(res['rows']);
                resolve(res);
            }
        });
    });

};


var coreFunctions = require("../../core/gps_track_sciencefeatures");
/////////////////format: param_name(param_type)
//input
//params:raceinfo(object),tracks(list)
//raceinfo:{'raceid'(string),'starttime'(string),'start_lon'(real),'start_lat'(real),'end_lon'(real),'end_lat'(real)}
//tracks:list(object)
//track object:{'racerecordid'(string),'data'(list(object)),'arrivingtime'(string)}
//track data object:{'lon'(real),'lat'(real),'time'(string),'distance'(real),'ele'(real)}
/////////////////
//return:rowForSummaryFeatures_list(list(object))
//return:object:{'racename'(string),'gpxfilename'(string),'straightspeed'(real),'realspeed'(real),'realdistance'(real),'avgelevation'(real),'routeefficiency'(real)}
module.exports.addrace = function (raceinfo,tracks) {
    var rowSummaryFeatures_list = coreFunctions.race_cloud_makeSummaryFeatures(raceinfo,tracks);
    // console.log(rowSummaryFeatures_list);
    var functionList = [];
    for (var i = 0; i < rowSummaryFeatures_list.length; i++) {
        var raceid = rowSummaryFeatures_list[i]['raceid'];
        var racerecordid = rowSummaryFeatures_list[i]['racerecordid'];
        var straightspeed = rowSummaryFeatures_list[i]['straightspeed'];
        var realspeed = rowSummaryFeatures_list[i]['realspeed'];
        var realdistance = rowSummaryFeatures_list[i]['realdistance'];
        var avgelevation = rowSummaryFeatures_list[i]['avgelevation'];
        var routeefficiency = rowSummaryFeatures_list[i]['routeefficiency'];
        //make id
        var now = Date.now().strftime("%m/%d/%Y, %H:%M:%S")
        var idraw = "{}{}".format(racerecordid, now)
        var racerecordsummaryid = hashlib.md5(idraw.encode()).hexdigest()

        functionList.push(insertRow(raceid, racerecordid,racerecordsummaryid, straightspeed, realspeed,realdistance,avgelevation,routeefficiency));
    }

    function insertRow(raceid, racerecordid,racerecordsummaryid, straightspeed, realspeed,realdistance,avgelevation,routeefficiency) {
        var sql = 'insert into cloudracerecord_sciencesummary (raceid, racerecordid,racerecordsummaryid, straightspeed, realspeed,realdistance,avgelevation,routeefficiency) VALUES($1,$2,$3,$4,$5,$6,$7,$8)';
        var params = [raceid, racerecordid,racerecordsummaryid, straightspeed, realspeed,realdistance,avgelevation,routeefficiency];

        return new Promise(function (resolve, reject) {
            pg_client.query(sql, params, (err, res) => {
                // console.log(res,err);
                if (err) {
                    reject(err);
                }
                else {
                    resolve(res);
                }
            });
        });
    }

    return new Promise(function (resolve, reject) {
        Promise.all(functionList)
            .then(values => {
                resolve(values);
            })
            .catch(errs => {
                reject(errs);
            });
    });
};