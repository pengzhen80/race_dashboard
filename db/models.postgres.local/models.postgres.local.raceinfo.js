var pg_client = require("../db.cloud.local")

module.exports.searchByRacename = function (racename) {
    var sql = 'select * from cloudrace where racename = ?';
    var params = [racename];

    return new Promise(function (resolve, reject) {
        pg_client.query(sql, params, (err,res) => {
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

module.exports.searchAllRace = function () {
    var sql = 'select * from cloudrace';
    var params = [];

    return new Promise(function (resolve, reject) {
        pg_client.query(sql, params, (err,res) => {
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

