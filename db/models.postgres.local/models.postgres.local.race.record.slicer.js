const pgClient = require('../clients/db.cloud.local');
const coreFunctions = require('../../core/gps_track_sciencefeatures');
const { v4: uuidv4 } = require('uuid');
// var hashlib = require("hashlib");

module.exports.searchrace = function(raceid) {
  console.log(raceid, typeof(raceid));
  const sql = 'select raceid,racerecordid,straightspeed,routeefficiency from cloudracerecordslicer where raceid = $1';
  const params = [raceid];

  return new Promise(function(resolve, reject) {
    pgClient.query(sql, params, (err, res) => {
      // console.log(res,err);
      if (err) {
        reject(err);
      } else {
        console.log(res['rows'].length);
        resolve(res);
      }
    });
  });
};

/////////////////format: param_name(param_type)
//input
//params:raceinfo(object),tracks(list),minutes(number) 
//raceinfo:{'starttime'(string),'start_lon'(real),'start_lat'(real),'end_lon'(real),'end_lat'(real)}
//tracks:list(object)
//track object:{'racerecordid'(string),'data'(list(object))}
//track data object:{'lon'(real),'lat'(real),'time'(string),'distance'(real)}
/////////////////
//return:list(object)
//object:{racerecordid(string),straightspeed(list(real)),routeefficiency(list(real))}
module.exports.addrace = function(raceid,raceinfo, tracks,minutes) {
  console.log(raceid);
  console.log(raceinfo);
  console.log(tracks.length);
  console.log(minutes);
  const rowForDashboard_list = coreFunctions.splicerStraightAndRouteEffWithTime(raceinfo[0], tracks,minutes);
  // console.log(rowSummaryFeaturesList);
  const functionList = [];
  for (let i = 0; i < rowForDashboard_list.length; i++) {
    const racerecordid = rowForDashboard_list[i]['racerecordid'];
    const straightspeed = rowForDashboard_list[i]['straightspeed'];
    const routeefficiency = rowForDashboard_list[i]['routeefficiency'];
    // make id
    // const now = Date.now().strftime('%m/%d/%Y, %H:%M:%S');
    const racerecordslicerid = uuidv4();

    functionList.push(insertRow(raceid, racerecordid, racerecordslicerid, straightspeed, routeefficiency));
  }

  /**
   *
   * @param {string}raceid raceid
   * @param {string}racerecordid racerecordid
   * @param {string}racerecordslicerid racerecordsummaryid
   * @param {number[]}straightspeed straightspeed
   * @param {number[]}routeefficiency routeefficiency
   * @return {Promise<any>} err if query err, rows if query success;
   */
  function insertRow(raceid, racerecordid, racerecordslicerid, straightspeed, routeefficiency) {
    const sql = 'insert into cloudracerecordslicer (raceid, racerecordid, racerecordslicerid, straightspeed, routeefficiency) VALUES($1,$2,$3,$4,$5)';
    const params = [raceid, racerecordid, racerecordslicerid, straightspeed, routeefficiency];

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

   /**
   *
   * @param {string}raceid raceid
   * @param {string}racerecordid racerecordid
   * @param {string}racerecordslicerid racerecordsummaryid
   * @param {number[]}straightspeed straightspeed
   * @param {number[]}routeefficiency routeefficiency
   * @return {Promise<any>} err if query err, rows if query success;
   */
   function insertRows(raceid, racerecordid, racerecordslicerid, straightspeed, routeefficiency) {
    const sql = 'insert into cloudracerecordslicer (raceid, racerecordid, racerecordslicerid, straightspeed, routeefficiency) VALUES($1,$2,$3,$4,$5)';
    const params = [raceid, racerecordid, racerecordslicerid, straightspeed, routeefficiency];

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
