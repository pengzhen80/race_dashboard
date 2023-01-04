var db = require("../clients/db.sqlites")

module.exports.searchByRacename = function (racename) {
    var sql = 'select * from t_race_info where racename = ?';
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

