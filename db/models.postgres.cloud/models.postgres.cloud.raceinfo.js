var pg_client = require("../clients/db.cloud")

/////////////////format: param_name(param_type)
//input
//params:rows(list(object))
//row object:at least{'raceid'(string),'starttime'(string),'racetitle'(string),'releaseposition'(string),'arrivalposition'(string)}
//eg:"8f4342bc75658b1610962bac739e06f6"	"2021神齐俱乐部秋季赛"	"2021-08-30 08:26:00"	"44.24520,112.32422"	"40.44695,114.82910"
/////////////////
//return:raceinfo_list:list(object)
//object:{'raceid'(string),'racename'(string),'start_lat'(real),'start_lon'(real),'end_lat'(real),'end_lon'(real),'starttime'(string)}
//eg: 8f4342bc75658b1610962bac739e06f6  唐山尼尔森赛鸽公棚-2022决赛	42.20392	123.25294	39.5167	118.14257	2022-05-21 05:08:00
function model_make_raceinfo(rows)
{
    // console.log(rows,typeof(rows[0]['starttime']));
    var raceinfo_list = [];
    for(var i=0;i<rows.length;i++)
    {
        var raceinfo = {};
        raceinfo['raceid'] = rows[i]['raceid'];
        raceinfo['racename'] = rows[i]['racetitle'];
        var [start_lat,start_lon] = rows[i]['releaseposition'].split(",");
        var [end_lat,end_lon] = rows[i]['arrivalposition'].split(",");

        raceinfo['start_lat'] = parseFloat(start_lat);
        raceinfo['start_lon'] = parseFloat(start_lon);
        raceinfo['end_lat'] = parseFloat(end_lat);
        raceinfo['end_lon'] = parseFloat(end_lon);
        raceinfo['starttime'] = rows[i]['starttime'];

        raceinfo_list.push(raceinfo);
    }
    console.log(raceinfo_list);
    return raceinfo_list;
}

module.exports.searchByRacename = function (racename) {
    var sql = 'select raceid,racetitle,starttime,releaseposition,arrivalposition from cloudrace where racetitle = $1';
    var params = [racename];

    return new Promise(function (resolve, reject) {
        pg_client.query(sql, params, (err,res) => {
            if(err)
            {
                reject(err);
            }
            else
            {
                resolve(model_make_raceinfo(res['rows']));
            }
        });
    });

};

module.exports.searchAllRace = function () {
    var sql = 'select raceid,racetitle,starttime,releaseposition,arrivalposition from cloudrace where racetitle IS NOT NULL and starttime IS NOT NULL and releaseposition IS NOT NULL and arrivalposition IS NOT NULL';
    var params = [];

    return new Promise(function (resolve, reject) {
        pg_client.query(sql, params, (err,res) => {
            if(err)
            {
                reject(err);
            }
            else
            {
                resolve(model_make_raceinfo(res['rows']));
            }
        });
    });

};

