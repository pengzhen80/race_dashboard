var db = require("../clients/db.sqlites")

module.exports.searchByRacename = function (racename) {
    var sql = 'select * from t_race_rank where racename = ?';
    var params = [racename];

    return new Promise(function (resolve, reject) {
        db.all(sql, params, (err,res) => {
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

function searchBytrackname(trackname){
    var sql = 'select * from t_race_rank where gpxfilename = ?';
    var params = [trackname];

    return new Promise(function (resolve, reject) {
        db.all(sql, params, (err,res) => {
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
        functionList.push(searchBytrackname(trackname_list[i]));
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

module.exports.searchByRacename_rankLimit = function (racename,rank) {
    var sql = 'select * from t_race_rank where racename = ? and rank < ?';
    var params = [racename,rank];

    return new Promise(function (resolve, reject) {
        db.all(sql, params, (err,res) => {
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