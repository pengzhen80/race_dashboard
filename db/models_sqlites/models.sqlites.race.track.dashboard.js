var db = require("../clients/db.sqlites")

module.exports.searchrace = function (racename) {
    console.log(racename);
    var sql = 'select * from t_race_dashboard where racename = ?';
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