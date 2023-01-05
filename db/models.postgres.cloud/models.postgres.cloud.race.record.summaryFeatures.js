const pgClient = require('../clients/db.cloud');
const coreFunctions = require('../../core/gps_track_sciencefeatures');
// var hashlib = require("hashlib");

module.exports.searchrace = function(raceid) {
  console.log(raceid, typeof(raceid));
  const sql = 'select racerecordid,raceid,straightdistance,straightspeed,realdistance,realspeed from cloudracecertificate where raceid = $1 and straightdistance IS NOT NULL and straightspeed IS NOT NULL and realdistance IS NOT NULL and realspeed IS NOT NULL';
  const params = [raceid];

  return new Promise(function(resolve, reject) {
    pgClient.query(sql, params, (err, res) => {
      // console.log(res,err);
      if (err) {
        reject(err);
      } else {
        console.log(res['rows'].length);
        res = coreFunctions.science_race_recordSummary_addRouteEfficiency(res['rows']);
        resolve(res);
      }
    });
  });
};

// ///////////////format: param_name(param_type)
// input
// params:raceinfo(object),tracks(list)
// raceinfo:{'raceid'(string),'starttime'(string),'start_lon'(real),'start_lat'(real),'end_lon'(real),'end_lat'(real)}
// tracks:list(object)
// track object:{'racerecordid'(string),'data'(list(object)),'arrivingtime'(string)}
// track data object:{'lon'(real),'lat'(real),'time'(string),'distance'(real),'ele'(real)}
// ///////////////
// return:rowForSummaryFeatures_list(list(object))
// return:object:{'racename'(string),'gpxfilename'(string),'straightspeed'(real),'realspeed'(real),'realdistance'(real),'avgelevation'(real),'routeefficiency'(real)}
module.exports.addrace = function(raceinfo, tracks) {
  const rowSummaryFeaturesList = coreFunctions.race_cloud_makeSummaryFeatures(raceinfo, tracks);
  // console.log(rowSummaryFeaturesList);
  const functionList = [];
  for (let i = 0; i < rowSummaryFeaturesList.length; i++) {
    const raceid = rowSummaryFeaturesList[i]['raceid'];
    const racerecordid = rowSummaryFeaturesList[i]['racerecordid'];
    const straightspeed = rowSummaryFeaturesList[i]['straightspeed'];
    const realspeed = rowSummaryFeaturesList[i]['realspeed'];
    const realdistance = rowSummaryFeaturesList[i]['realdistance'];
    const avgelevation = rowSummaryFeaturesList[i]['avgelevation'];
    const routeefficiency = rowSummaryFeaturesList[i]['routeefficiency'];
    // make id
    const now = Date.now().strftime('%m/%d/%Y, %H:%M:%S');
    const idraw = '{}{}'.format(racerecordid, now);
    const racerecordsummaryid = hashlib.md5(idraw.encode()).hexdigest();

    functionList.push(insertRow(raceid, racerecordid, racerecordsummaryid, straightspeed, realspeed, realdistance, avgelevation, routeefficiency));
  }

  /**
   *
   * @param {string}raceid raceid
   * @param {string}racerecordid racerecordid
   * @param {string}racerecordsummaryid racerecordsummaryid
   * @param {number}straightspeed straightspeed
   * @param {number}realspeed realspeed
   * @param {number}realdistance realdistance
   * @param {number}avgelevation avgelevation
   * @param {number}routeefficiency routeefficiency
   * @return {Promise<any>} err if query err, rows if query success;
   */
  function insertRow(raceid, racerecordid, racerecordsummaryid, straightspeed, realspeed, realdistance, avgelevation, routeefficiency) {
    const sql = 'insert into cloudracerecord_sciencesummary (raceid, racerecordid,racerecordsummaryid, straightspeed, realspeed,realdistance,avgelevation,routeefficiency) VALUES($1,$2,$3,$4,$5,$6,$7,$8)';
    const params = [raceid, racerecordid, racerecordsummaryid, straightspeed, realspeed, realdistance, avgelevation, routeefficiency];

    return new Promise(function(resolve, reject) {
      pgClient.query(sql, params, (err, res) => {
        // console.log(res,err);
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  }

  return new Promise(function(resolve, reject) {
    Promise.all(functionList)
        .then((values) => {
          resolve(values);
        })
        .catch((errs) => {
          reject(errs);
        });
  });
};
