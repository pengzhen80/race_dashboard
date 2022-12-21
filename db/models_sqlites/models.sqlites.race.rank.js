var db = require("../db.sqlites")

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