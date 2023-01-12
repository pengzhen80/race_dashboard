const pgClient = require('../clients/db.cloud');
/**
 *
 * @param {object[]}rows object{racerecordid(string),utc(list),fix(list),latitude(list),longitude(list),realdistance(list),gpsheight(list),gpsspeed(list),direction(list)}
 * @return {object[]} object:{'racerecordid'(string),'data'(list(object))}
 * object:{"lat"(real),"lon"(real),"ele"(real),"speed"(real),"distance"(real),"time"(string),"heading"(real)}
 */
function modelMakeRaceTrackRawdata(rows) {
  // console.log(rows.length);
  const raceTrackRawdataList = [];
  for (let i=0; i<rows.length; i++) {
    const trackRawdata = {};
    trackRawdata['racerecordid'] = rows[i]['racerecordid'];
    trackRawdata['data'] = makeRawData(rows[i]['utc'], rows[i]['fix'], rows[i]['latitude'], rows[i]['longitude'], rows[i]['realdistance'], rows[i]['gpsheight'], rows[i]['gpsspeed'], rows[i]['direction']);
    /**
     *
     * @param {string[]}utc utc
     * @param {string[]}fix fix
     * @param {string[]}latitude latitude
     * @param {string[]}longitude longitude
     * @param {string[]}realdistance realdistance
     * @param {string[]}gpsheight gpsheight
     * @param {string[]}gpsspeed gpsspeed
     * @param {string[]}direction direction
     * @return {object[]}
     */
    function makeRawData(utc, fix, latitude, longitude, realdistance, gpsheight, gpsspeed, direction) {
      const dataList = [];
      for (let i =0; i<fix.length; i++) {
        // 從雲端資料庫的查詢結果來看，raceinfo中的starttime是北京時間，而軌跡的text的時間是utc時間；
        // 如果對查詢結果的時間不進行手動轉換，會導致時間錯誤，使用js讀取的時候，會自動轉換成utc時間；
        // 做法是把text中的時間+8個小時，就變成了正常的utc時間；
        utc[i].setHours(utc[i].getHours() + 8);
        console.log(utc[i]);
        const cell = {};
        if (fix[i]!='2D'&&fix[i]!='3D') {
          continue;
        } else {
          cell['fix'] = fix[i];
          cell['utc'] = utc[i];
          cell['lat'] = parseFloat(latitude[i]);
          cell['lon'] = parseFloat(longitude[i]);
          cell['distance'] = parseFloat(realdistance[i]);
          cell['ele'] = parseFloat(gpsheight[i]);
          cell['speed'] = parseFloat(gpsspeed[i]);
          cell['heading'] = parseFloat(direction[i]);
        }
        dataList.push(cell);
      }
      return dataList;
    }
    raceTrackRawdataList.push(trackRawdata);
  }
  // console.log(raceTrackRawdataList);
  return raceTrackRawdataList;
}

/**
 *
 * @param {string}raceRecordId raceRecordId
 * @return {Promise<any>} err if query err, rows if query success;
 */
function searchByRaceRecordId(raceRecordId) {
  const sql = 'select racerecordid,utc,fix,latitude,longitude,cloudracetext.realdistance,gpsheight,gpsspeed,direction from cloudracetext where racerecordid = $1';
  const params = [raceRecordId];

  return new Promise(function(resolve, reject) {
    pgClient.query(sql, params, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(modelMakeRaceTrackRawdata(res['rows']));
        // resolve(res['rows']);
      }
    });
  });
};

/**
 *
 * @param {string[]} raceRecordIdList raceRecordIdList
 * @return {Promise<any>} err if query err, rows if query success;
 */
function searchByRaceRecordIdListOptimize(raceRecordIdList) {
  console.log('start prepare raw data');
  const starttime = Date.now();
  // console.log(raceRecordIdList.length);
  const params = [];
  for (let i = 1; i <= raceRecordIdList.length; i++) {
    params.push('$' + i);
  }
  // console.log(params);

  const sql = 'select racerecordid,utc,fix,latitude,longitude,cloudracetext.realdistance,gpsheight,gpsspeed,direction from cloudracetext where racerecordid IN (' + params.join(',') + ')';
  // console.log(sql);
  return new Promise(function(resolve, reject) {
    pgClient.query(sql, raceRecordIdList, (err, res) => {
      if (err) {
        reject(err);
      } else {
        const endtime = Date.now();
        console.log('data prepared', endtime.toString() - starttime.toString());
        // resolve(modelMakeRaceTrackRawdata(res['rows']));
        resolve(modelMakeRaceTrackRawdata(res['rows']));
      }
    });
  });
};

/**
 *
 * @param {string[]}raceRecordIdList raceRecordIdList
 * @return {Promise<any>} err if query err, rows if query success;
 */
function searchByRaceRecordIdList(raceRecordIdList) {
  console.log('start prepare raw data');
  const starttime = Date.now();
  const functionList = [];
  for (let i=0; i<raceRecordIdList.length; i++) {
    functionList.push(searchByRaceRecordId(raceRecordIdList[i]));
  }

  return new Promise(function(resolve, reject) {
    Promise.all(functionList)
        .then((values)=>{
          const endtime = Date.now();
          console.log('data prepared', endtime.toString() - starttime.toString());
          resolve(values);
        })
        .catch((errs)=>{
          reject(errs);
        });
  });
};

// module.exports.searchAllRace = function () {
//     var sql = 'select raceid,racetitle,starttime,releaseposition,arrivalposition from cloudrace where racetitle IS NOT NULL and starttime IS NOT NULL and releaseposition IS NOT NULL and arrivalposition IS NOT NULL';
//     var params = [];

//     return new Promise(function (resolve, reject) {
//         pgClient.query(sql, params, (err,res) => {
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
module.exports.searchByRaceRecordIdListOptimize = searchByRaceRecordIdListOptimize;
