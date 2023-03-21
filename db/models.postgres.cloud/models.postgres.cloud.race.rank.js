const pgClient = require('../clients/db.cloud');

/**
 *
 * @param {object[]}rows object{'raceid'(string),'racerecordid'(string),'singleranking'(string),'arrivaltime'(string)}
 * @return {object[]} object{'raceid'(string),'racerecordid'(string),'rank'(number),'arrivingtime'(string)}
 */
function modelMakeRacerank(rows) {
  console.log(typeof(rows[0]['orgring']),rows[0]['orgring']);
  const racerankList = [];
  for (let i=0; i<rows.length; i++) {
    const rankinfo = {};
    rankinfo['raceid'] = rows[i]['raceid'];
    rankinfo['racerecordid'] = rows[i]['racerecordid'];
    rankinfo['orgring'] = rows[i]['orgring'];
    rankinfo['rank'] = rows[i]['singleranking'];
    rankinfo['arrivingtime'] = rows[i]['arrivaltime'];

    racerankList.push(rankinfo);
  }
  // console.log(racerankList);
  return racerankList;
}

module.exports.searchByRaceId = function(raceId) {
  const sql = 'select raceid,racerecordid,orgring,singleranking,arrivaltime from cloudracecertificate where raceid = $1 and singleranking IS NOT NULL and arrivaltime IS NOT NULL';
  const params = [raceId];

  return new Promise(function(resolve, reject) {
    pgClient.query(sql, params, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(modelMakeRacerank(res['rows']));
      }
    });
  });
};


module.exports.searchByRaceId_limitbyrank = function(raceId, rank) {
  const sql = 'select raceid,racerecordid,orgring,singleranking,arrivaltime from cloudracecertificate where raceid = $1 and singleranking IS NOT NULL and arrivaltime IS NOT NULL';
  const params = [raceId];

  return new Promise(function(resolve, reject) {
    pgClient.query(sql, params, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(modelMakeRacerank(rowsFilterByrank(res['rows'], rank)));
      }
    });
  });

  // cuase rank is string ,cannot use < to query, so filter by local function
  /**
   *
   * @param {object[]} rows tracks' rank
   * @param {number} rank number of rank limit
   * @return {object[]} rows by limited rank
   */
  function rowsFilterByrank(rows, rank) {
    const filteredRows = [];
    for (let i=0; i<rows.length; i++) {
      if (Number(rows[i]['singleranking'])<= rank) {
        filteredRows.push(rows[i]);
      }
    }
    return (filteredRows);
  }
};


