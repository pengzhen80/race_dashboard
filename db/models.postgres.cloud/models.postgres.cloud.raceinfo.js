const pgClient = require('../clients/db.cloud');

/**
 *
 * @param {object[]}rows object:at least{'raceid'(string),'starttime'(string),'racetitle'(string),'releaseposition'(string),'arrivalposition'(string)}
 * @return {object[]} object:{'raceid'(string),'racename'(string),'startLat'(real),'startLon'(real),'endLat'(real),'endLon'(real),'starttime'(string)}
 */
function modelMakeRaceinfo(rows) {
  console.log(rows,typeof(rows[0]['starttime']));
  console.log(rows[0]['starttime']);
  const raceinfoList = [];
  for (let i=0; i<rows.length; i++) {
    const raceinfo = {};
    raceinfo['raceid'] = rows[i]['raceid'];
    raceinfo['racename'] = rows[i]['racetitle'];
    const [startLat, startLon] = rows[i]['releaseposition'].split(',');
    const [endLat, endLon] = rows[i]['arrivalposition'].split(',');

    raceinfo['startlat'] = parseFloat(startLat);
    raceinfo['startlon'] = parseFloat(startLon);
    raceinfo['endlat'] = parseFloat(endLat);
    raceinfo['endlon'] = parseFloat(endLon);
    raceinfo['starttime'] = rows[i]['starttime'];

    raceinfoList.push(raceinfo);
  }
  console.log(raceinfoList);
  return raceinfoList;
}

module.exports.searchByRacename = function(racename) {
  const sql = 'select raceid,racetitle,starttime,releaseposition,arrivalposition from cloudrace where racetitle = $1';
  const params = [racename];

  return new Promise(function(resolve, reject) {
    pgClient.query(sql, params, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(modelMakeRaceinfo(res['rows']));
      }
    });
  });
};
module.exports.searchByRaceId = function(raceid) {
  const sql = 'select raceid,racetitle,starttime,releaseposition,arrivalposition from cloudrace where raceid = $1';
  const params = [raceid];

  return new Promise(function(resolve, reject) {
    pgClient.query(sql, params, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(modelMakeRaceinfo(res['rows']));
      }
    });
  });
};
module.exports.searchAllRace = function() {
  const sql = 'select raceid,racetitle,starttime,releaseposition,arrivalposition from cloudrace where racetitle IS NOT NULL and starttime IS NOT NULL and releaseposition IS NOT NULL and arrivalposition IS NOT NULL';
  const params = [];

  return new Promise(function(resolve, reject) {
    pgClient.query(sql, params, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(modelMakeRaceinfo(res['rows']));
      }
    });
  });
};

