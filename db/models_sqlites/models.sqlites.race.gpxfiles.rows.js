var db = require("../clients/db.sqlites")

function searchByGpxfilename(trackname) {
    var sql = "SELECT count,lat,lon,ele,speed,distance,time,heading from t_race_gpxfiles_rows where gpxfilename =? ORDER by count;";
    var params = [trackname];
                // console.log(params);
    return new Promise(function(resolve,reject){
        db.all(sql, params, (err, rows) => {
            // res_tracks[trackIndex]['data'] = rows;
            if(err)
            {
                reject(err);
            }
            else
            {
                resolve(rows);
            }  
        });
    })

};

function searchByGpxfilenameList(trackname_list) {
    var functionList = [];
    for(var i=0;i<trackname_list.length;i++)
    {
        functionList.push(searchByGpxfilename(trackname_list[i]));
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
};

module.exports.searchByGpxfilename = searchByGpxfilename;
module.exports.searchByGpxfilenameList = searchByGpxfilenameList;