var pg_client = require("../db.cloud.local")

/////////////////format: param_name(param_type)
//input
//params:rows(list(object))
//row object:at least{racerecordid(string),utc(string(list)),fix(string(list)),latitude(string(list)),longitude(string(list)),realdistance(string(list)),gpsheight(string(list)),gpsspeed(string(list)),direction(string(list))}
//string(list) : "{value1,value2}"
/////////////////
//return:race_track_rawdata_list:list(object)
//object:{'racerecordid'(string),'data'(list(object))}
//object:{"lat"(real),"lon"(real),"ele"(real),"speed"(real),"distance"(real),"time"(string),"heading"(real)}
function model_make_race_track_rawdata(rows)
{
    // console.log(rows,typeof(rows[0]['starttime']));
    var race_track_rawdata_list = [];
    for(var i=0;i<rows.length;i++)
    {
        var track_rawdata = {};
        track_rawdata['racerecordid'] = rows[i]['racerecordid'];
        track_rawdata['data'] = makeRawData(rows[i]['utc'],rows[i]['fix'],rows[i]['latitude'],rows[i]['longitude'],rows[i]['realdistance'],rows[i]['gpsheight'],rows[i]['gpsspeed'],rows[i]['direction'])
        function makeRawData(utc,fix,latitude,longitude,realdistance,gpsheight,gpsspeed,direction)
        {
            utc = JSON.parse("{" + utc + "}");
            fix = JSON.parse("{" + fix + "}");
            latitude = JSON.parse("{" + latitude + "}");
            longitude = JSON.parse("{" + longitude + "}");
            realdistance = JSON.parse("{" + realdistance + "}");
            gpsheight = JSON.parse("{" + gpsheight + "}");
            gpsspeed = JSON.parse("{" + gpsspeed + "}");
            direction = JSON.parse("{" + direction + "}");

            var data_list = [];
            for(var i =0;i<fix.length;i++)
            {
                var cell = {};
                if(fix[i]!='2D'||fix[i]!='3D')
                {
                    continue;
                }
                else
                {
                    cell['fix'] = parseFloat(fix[i]);
                    cell['utc'] = parseFloat(utc[i]);
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

module.exports.searchByRaceRecordId = function (raceRecordId) {
    var sql = "select racerecordid,utc,fix,latitude,longitude,cloudracetext.realdistance,gpsheight,gpsspeed,direction from cloudracetext where racerecordid = $1";
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

