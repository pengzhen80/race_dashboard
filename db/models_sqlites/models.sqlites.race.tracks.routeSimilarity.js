var db = require("../clients/db.sqlites")
var coreFunctions = require("../../core/gps_track_sciencefeatures");

/////////////////format: param_name(param_type)
//input
//params:racename(string),tracks(list)
//tracks:list(object)
//track object:{'name'(string),'data'(list(object))}
//track data object:{'lon'(real),'lat'(real),'time'(string),'distance'(real)}
module.exports.insertrace = function (racename, tracks) {
    var rowForRouteSimilarity_list = coreFunctions.multiRoutes_routeSimilarity_allCombination_returnAvgTrackDistance(tracks);
    var functionList = [];
    for (var i = 0; i < rowForRouteSimilarity_list.length; i++) {
        var gpxfilename_base = rowForRouteSimilarity_list[i]['gpxfilename_base'];
        var gpxfilename_comparator = rowForRouteSimilarity_list[i]['gpxfilename_comparator'];
        var avg_track_distance = rowForRouteSimilarity_list[i]['avg_track_distance'];
        functionList.push(insertRow(racename, gpxfilename_base, gpxfilename_comparator, avg_track_distance));
    }

    function insertRow(racename, gpxfilename_base, gpxfilename_comparator, avg_track_distance) {
        var sql = 'insert into t_race_tracks_routeSimilarity (racename,gpxfilename_base,gpxfilename_comparator,avg_track_distance) VALUES(?,?,?,?)';
        var params = [racename, gpxfilename_base, gpxfilename_comparator, avg_track_distance];

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

module.exports.searchrace = function (racename) {

    var sql = 'select * from t_race_tracks_routeSimilarity where racename = ?';
    var params = [racename];

    return new Promise(function (resolve, reject) {
        db.all(sql, params, (err, res) => {
            // console.log(res,err);
            if (err) {
                reject(err);
            }
            else {
                resolve(res);
            }
        });
    });

};