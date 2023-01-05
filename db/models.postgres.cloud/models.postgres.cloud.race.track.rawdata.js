var pg_client = require("../clients/db.cloud")

/////////////////format: param_name(param_type)
//input
//params:rows(list(object))
//row object:at least{racerecordid(string),utc(list),fix(list),latitude(list),longitude(list),realdistance(list),gpsheight(list),gpsspeed(list),direction(list)}
/////////////////
//return:race_track_rawdata_list:list(object)
//object:{'racerecordid'(string),'data'(list(object))}
//object:{"lat"(real),"lon"(real),"ele"(real),"speed"(real),"distance"(real),"time"(string),"heading"(real)}
function model_make_race_track_rawdata(rows)
{
    // console.log(rows.length);
    var race_track_rawdata_list = [];
    for(var i=0;i<rows.length;i++)
    {
        var track_rawdata = {};
        track_rawdata['racerecordid'] = rows[i]['racerecordid'];
        track_rawdata['data'] = makeRawData(rows[i]['utc'],rows[i]['fix'],rows[i]['latitude'],rows[i]['longitude'],rows[i]['realdistance'],rows[i]['gpsheight'],rows[i]['gpsspeed'],rows[i]['direction'])
        function makeRawData(utc,fix,latitude,longitude,realdistance,gpsheight,gpsspeed,direction)
        {
            var data_list = [];
            for(var i =0;i<fix.length;i++)
            {
                // console.log(fix[i]);
                var cell = {};
                if(fix[i]!='2D'&&fix[i]!='3D')
                {
                    continue;
                }
                else
                {
                    cell['fix'] = fix[i];
                    cell['utc'] = utc[i];
                    cell['lat'] = parseFloat(latitude[i]);
                    cell['lon'] = parseFloat(longitude[i]);
                    cell['distance'] = parseFloat(realdistance[i]);
                    cell['ele'] = parseFloat(gpsheight[i]);
                    cell['speed'] = parseFloat(gpsspeed[i]);
                    cell['heading'] = parseFloat(direction[i]);
                }
                data_list.push(cell);
            }
            return data_list;
        }
        race_track_rawdata_list.push(track_rawdata);
    }
    // console.log(race_track_rawdata_list);
    return race_track_rawdata_list;
}

function searchByRaceRecordId(raceRecordId) {
    var sql = 'select racerecordid,utc,fix,latitude,longitude,cloudracetext.realdistance,gpsheight,gpsspeed,direction from cloudracetext where racerecordid = $1';
    var params = [raceRecordId];

    return new Promise(function (resolve, reject) {
        pg_client.query(sql, params, (err,res) => {
            if(err)
            {
                reject(err);
            }
            else
            {
                resolve(model_make_race_track_rawdata(res['rows']));
                // resolve(res['rows']);
            }
        });
    });

};

function searchByRaceRecordIdList_optimize(raceRecordId_list) {
    console.log('start prepare raw data');
    var starttime = Date.now();
    console.log(raceRecordId_list.length);
    var params = [];
    for(var i = 1; i <= raceRecordId_list.length; i++) {
        params.push('$' + i);
    }
    console.log(params);

    var sql = 'select racerecordid,utc,fix,latitude,longitude,cloudracetext.realdistance,gpsheight,gpsspeed,direction from cloudracetext where racerecordid IN (' + params.join(',') + ')';
    console.log(sql);
    return new Promise(function (resolve, reject) {
        pg_client.query(sql, raceRecordId_list, (err,res) => {
            if(err)
            {
                reject(err);
            }
            else
            {
                var endtime = Date.now();
                console.log('data prepared',endtime.toString() - starttime.toString());
                // resolve(model_make_race_track_rawdata(res['rows']));
                resolve(model_make_race_track_rawdata(res['rows']));
            }
        });
    });
};

function searchByRaceRecordIdList(raceRecordId_list) {
    console.log('start prepare raw data');
    var starttime = Date.now();
    var functionList = [];
    for(var i=0;i<raceRecordId_list.length;i++)
    {
        functionList.push(searchByRaceRecordId(raceRecordId_list[i]));
    }

    return new Promise(function(resolve,reject){
        Promise.all(functionList)
        .then(values=>{
            var endtime = Date.now();
            console.log('data prepared',endtime.toString() - starttime.toString());
            resolve(values);
        })
        .catch(errs=>{
            reject(errs);
        });
    })
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

module.exports.searchByRaceRecordId =searchByRaceRecordId;
module.exports.searchByRaceRecordIdList =searchByRaceRecordIdList;
module.exports.searchByRaceRecordIdList_optimize = searchByRaceRecordIdList_optimize;