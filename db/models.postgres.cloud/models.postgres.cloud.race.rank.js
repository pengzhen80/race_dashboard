var pg_client = require("../clients/db.cloud")

/////////////////format: param_name(param_type)
//input
//params:rows(list(object))
//row object:at least{'raceid'(string),'racerecordid'(string),'singleranking'(string),'arrivaltime'(string)}
//eg:"8f4342bc75658b1610962bac739e06f6"	"5e85fb6bc586dfafb1b0506cd2d91a5c"	"4"	"2021-08-30 11:43:42"
/////////////////
//return:racerank_list:list(object)
//object:{'raceid'(string),'racerecordid'(string),'rank'(number),'arrivingtime'(string)}
function model_make_racerank(rows)
{
    // console.log(rows,typeof(rows[0]['starttime']));
    var racerank_list = [];
    for(var i=0;i<rows.length;i++)
    {
        var rankinfo = {};
        rankinfo['raceid'] = rows[i]['raceid'];
        rankinfo['racerecordid'] = rows[i]['racerecordid'];
        rankinfo['rank'] = rows[i]['singleranking'];
        rankinfo['arrivingtime'] = rows[i]['arrivaltime'];

        racerank_list.push(rankinfo);
    }
    console.log(racerank_list);
    return racerank_list;
}

module.exports.searchByRaceId = function (raceId) {
    var sql = "select raceid,racerecordid,singleranking,arrivaltime from cloudracecertificate where raceid = $1 and singleranking IS NOT NULL and arrivaltime IS NOT NULL";
    var params = [raceId];

    return new Promise(function (resolve, reject) {
        pg_client.query(sql, params, (err,res) => {
            if(err)
            {
                reject(err);
            }
            else
            {
                resolve(model_make_racerank(res['rows']));
            }
        });
    });

};

module.exports.searchByRaceId_limitbyrank = function (raceId,rank) {
    var sql = "select raceid,racerecordid,singleranking,arrivaltime from cloudracecertificate where raceid = $1 and singleranking < $2 and singleranking IS NOT NULL and arrivaltime IS NOT NULL";
    var params = [raceId,rank];

    return new Promise(function (resolve, reject) {
        pg_client.query(sql, params, (err,res) => {
            if(err)
            {
                reject(err);
            }
            else
            {
                resolve(model_make_racerank(res['rows']));
            }
        });
    });

};

// module.exports.searchAllRace = function () {
//     var sql = 'select raceid,racetitle,starttime,releaseposition,arrivalposition from cloudrace where racetitle IS NOT NULL and starttime IS NOT NULL and releaseposition IS NOT NULL and arrivalposition IS NOT NULL';
//     var params = [];

//     return new Promise(function (resolve, reject) {
//         pg_client.query(sql, params, (err,res) => {
//             if(err)
//             {
//                 reject(err);
//             }
//             else
//             {
//                 resolve(model_make_raceinfo(res['rows']));
//             }
//         });
//     });

// };

