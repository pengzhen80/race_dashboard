const express = require('express');
const router = express.Router();
const db = require('../../db/clients/db.sqlites');

router.post('/', (req, res, next) => {
  try {
    JSON.parse(req.body);
  } catch (err) {
    console.log('can not parser body');
    res.json({
      'message': 'wrong content type',
    });
  }
  const errors=[];
  try {
    JSON.parse(req.body);
  } catch (err) {
    console.log('can not parser body');
    res.json({
      'message': 'wrong content type',
    });
  }
  const body = JSON.parse(req.body);
  if (!body['racename']) {
    errors.push('No racename specified');
  }
  if (errors.length) {
    console.log(errors);
    res.status(400).json({'error': errors.join(',')});
    return;
  }
  const start = Date.now();
  console.log('starting', start);

  const resTracks = [];
  const sql = 'select rank, gpxfilename,arrivingtime from t_race_rank where racename = ? and rank<11 order by rank';
  const params = [body['racename']];
  // console.log(params);
  db.all(sql, params, (err, rows) => {
    if (err) {
      console.log(err);
      //   res.status(400).json({"error":err.message});
      //   return;
    }
    // make tracks
    initTrackDatas(rows);
    initTrackRawData();
  });
  /**
   * Desc : transfer db json data into api json data.
   *
   * @param {object[]} rows   object{gpxfilename,rank,arrivingtime}
   */
  function initTrackDatas(rows) {
    for (let i=0; i<rows.length; i++) {
      const track = {};
      track['name'] = rows[i]['gpxfilename'];
      track['rank'] = rows[i]['rank'];
      track['arrivingtime'] = rows[i]['arrivingtime'];
      resTracks.push(track);
    }
  }

  /**
   *
   */
  function initTrackRawData() {
    /**
     *
     * @param {number}trackIndex index of the track in resTracks
     * @return {Promise<any>} err if query err, rows if query success;
     */
    function getTrackRawData(trackIndex) {
      const trackname = resTracks[trackIndex]['name'];
      const sql = 'SELECT count,lat,lon,ele,speed,distance,time,heading from t_race_gpxfiles_rows where gpxfilename =? ORDER by count;';
      const params = [trackname];
      // console.log(params);
      return new Promise(function(resolve, reject) {
        db.all(sql, params, (err, rows) => {
          // resTracks[trackIndex]['data'] = rows;
          resolve(rows);
        });
      });
    }

    // make functions to promise
    const functionList = [];
    for (let i=0; i<resTracks.length; i++) {
      functionList.push(getTrackRawData(i));
    }

    Promise.all(functionList)
        .then(
            (values) => {
              for (i=0; i<values.length; i++) {
                resTracks[i]['data'] = values[i];
              }
              const end = Date.now();
              console.log('time need(s):', (end-start)/1000);

              const sql = 'select racename, start_lat, start_lon,end_lat,end_lon,starttime from t_race_info where racename = ?';
              const params = [body['racename']];
              db.all(sql, params, (err, rows) => {
                if (err) {
                  console.log(err);
                }
                res.json({
                  'raceinfo': rows,
                  'tracks': resTracks,
                });
              });
            },
        );
  }
});

module.exports = router;
