var db = require("../clients/db.sqlites")

module.exports.searchrace = function (racename) {
    console.log(racename);
    var sql = 'select * from t_race_track_summaryFeatures where racename = ?';
    var params = [racename];

    return new Promise(function (resolve, reject) {
        db.all(sql, params, (err,res) => {
            // console.log(res,err);
            if(err)
            {
                reject(err);
            }
            else
            {
                resolve(res);
            }
        });
    });

};

function searchbyTrackName(track_name) {
    console.log(track_name);
    var sql = 'select * from t_race_track_summaryFeatures where gpxfilename = ?';
    var params = [track_name];

    return new Promise(function (resolve, reject) {
        db.all(sql, params, (err,res) => {
            // console.log(res,err);
            if(err)
            {
                reject(err);
            }
            else
            {
                resolve(res);
            }
        });
    });

};

module.exports.searchByGpxfilenameList = function(trackname_list) {
    var functionList = [];
    for(var i=0;i<trackname_list.length;i++)
    {
        functionList.push(searchbyTrackName(trackname_list[i]));
    }
    return new Promise(function(resolve,reject){
        Promise.all(functionList)
        .then(values=>{
            resolve(values);
        })
        .catch(errs=>{
            reject(errs);
        });
    })
}

module.exports.deleterace = function (racename) {
    console.log(racename);
    var sql = 'delete from t_race_track_summaryFeatures where racename = ?';
    var params = [racename];

    return new Promise(function (resolve, reject) {
        db.all(sql, params, (err,res) => {
            // console.log(res,err);
            if(err)
            {
                reject(err);
            }
            else
            {
                resolve(res);
            }
        });
    });

};

var coreFunctions = require("../../core/gps_track_sciencefeatures");
/////////////////format: param_name(param_type)
//input
//params:raceinfo(object),tracks(list)
//raceinfo:{'starttime'(string),'start_lon'(real),'start_lat'(real),'end_lon'(real),'end_lat'(real)}
//tracks:list(object)
//track object:{'name'(string),'data'(list(object)),'arrivingtime'(string)}
//track data object:{'lon'(real),'lat'(real),'time'(string),'distance'(real)}
/////////////////
//return:rowForSummaryFeatures_list(list(object))
//return:object:{'racename'(string),'gpxfilename'(string),'straightspeed'(real),'realspeed'(real),'realdistance'(real),'avgelevation'(real),'routeefficiency'(real)}
module.exports.addrace = function (raceinfo,tracks) {
    var rowSummaryFeatures_list = coreFunctions.race_makeSummaryFeatures(raceinfo,tracks);
    // console.log(rowSummaryFeatures_list);
    var functionList = [];
    for (var i = 0; i < rowSummaryFeatures_list.length; i++) {
        var racename = rowSummaryFeatures_list[i]['racename'];
        var gpxfilename = rowSummaryFeatures_list[i]['gpxfilename'];
        var straightspeed = rowSummaryFeatures_list[i]['straightspeed'];
        var realspeed = rowSummaryFeatures_list[i]['realspeed'];
        var realdistance = rowSummaryFeatures_list[i]['realdistance'];
        var avgelevation = rowSummaryFeatures_list[i]['avgelevation'];
        var routeefficiency = rowSummaryFeatures_list[i]['routeefficiency'];
        functionList.push(insertRow(racename, gpxfilename, straightspeed, realspeed,realdistance,avgelevation,routeefficiency));
    }

    function insertRow(racename, gpxfilename, straightspeed, realspeed,realdistance,avgelevation,routeefficiency) {
        var sql = 'insert into t_race_track_summaryFeatures (racename, gpxfilename, straightspeed, realspeed,realdistance,avgelevation,routeefficiency) VALUES(?,?,?,?,?,?,?)';
        var params = [racename, gpxfilename, straightspeed, realspeed,realdistance,avgelevation,routeefficiency];

        return new Promise(function (resolve, reject) {
            db.run(sql, params, (err, res) => {
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