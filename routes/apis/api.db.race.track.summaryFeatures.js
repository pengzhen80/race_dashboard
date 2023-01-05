const express = require('express');
const router = express.Router();
const modelRaceTrackSummaryFeatures = require('../../db/models_sqlites/models.sqlites.race.track.summaryFeatures');
const modelRaceRank = require('../../db/models_sqlites/models.sqlites.race.rank');
const modelRaceTrackRawdata = require('../../db/models_sqlites/models.sqlites.race.gpxfiles.rows');
const modelRaceInfo = require('../../db/models_sqlites/models.sqlites.race.info');
const coreFunctions = require('../../core/gps_track_sciencefeatures');

router.post('/searchrace', (req, res, next) => {
  const errors = [];
  // check content type
  try {
    JSON.parse(req.body);
  } catch (err) {
    console.log('can not parser body');
    res.json({
      'message': 'wrong content type',
    });
  }
  // get body
  const body = JSON.parse(req.body);
  if (!body['racename']) {
    errors.push('No racename specified');
  }
  if (errors.length) {
    console.log(errors);
    res.status(400).json({'error': errors.join(',')});
    return;
  }
  console.log(body['racename']);
  modelRaceTrackSummaryFeatures.searchrace(body['racename'])
      .then((rows) => {
        // var normalize_row_list = [];
        // for (var i = 0; i < rows.length; i++) {
        //     // {
        //     //     "id": 5,
        //     //     "racename": "唐山尼尔森赛鸽公棚-2022决赛",
        //     //     "gpxfilename": "03-1899519",
        //     //     "straightspeed": 48.152,
        //     //     "realspeed": 50.619,
        //     //     "realdistance": 550.088,
        //     //     "avgelevation": 49.713,
        //     //     "routeefficiency": 0.951
        //     // },
        //     delete rows[i]["id"];
        //     normalize_row_list.push(rows[i]);
        // }
        res.json({
          'status': 'ok',
          'race_track_summaryFeatures': rows,
        });
      })
      .catch((err) => {
        console.log(err);
        res.json({
          'status': 'failed',
        });
      });
});

router.post('/deleterace', (req, res, next) => {
  const errors = [];
  // check content type
  try {
    JSON.parse(req.body);
  } catch (err) {
    console.log('can not parser body');
    res.json({
      'message': 'wrong content type',
    });
  }
  // get body
  const body = JSON.parse(req.body);
  if (!body['racename']) {
    errors.push('No racename specified');
  }
  if (errors.length) {
    console.log(errors);
    res.status(400).json({'error': errors.join(',')});
    return;
  }
  console.log(body['racename']);
  modelRaceTrackSummaryFeatures.deleterace(body['racename'])
      .then((rows) => {
        res.json({
          'status': 'success',
        });
      })
      .catch((err) => {
        console.log(err);
        res.json({
          'status': 'failed',
        });
      });
});

router.post('/addrace', (req, res, next) => {
  const errors = [];
  // console.log('req',req.params);
  // console.log('Body: ', req.body,typeof(req.body));
  // console.log('racename',req.body['racename']);
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

  let resTracks = [];
  modelRaceRank.searchByRacename(body['racename']).then((rows) => {
    // make tracks
    initTrackDatas(rows);
    initTrackRawData();
  }).catch((err) => {
    console.log(err);
  });

  /**
   *
   * @param {object[]}rows
   */
  function initTrackDatas(rows) {
    for (let i = 0; i < rows.length; i++) {
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
    const trackNameList = [];
    for (let i = 0; i < resTracks.length; i++) {
      trackNameList.push(resTracks[i]['name']);
    }
    modelRaceTrackRawdata.searchByGpxfilenameList(trackNameList).
        then((rowsRawdata) => {
          for (i = 0; i < rowsRawdata.length; i++) {
            resTracks[i]['data'] = rowsRawdata[i];
          }
          modelRaceInfo.searchByRacename(body['racename'])
              .then((rows) =>{
                const raceinfo = rows[0];
                resTracks = coreFunctions.track_make_withRaceEndpoint(raceinfo, resTracks);
                modelRaceTrackSummaryFeatures.addrace(raceinfo, resTracks)
                    .then((resSummary) =>{
                      res.json({
                        'message': 'success',
                      });
                    })
                    .catch((errSummary) =>{
                      res.json({
                        'message': 'fail',
                        'error': errSummary,
                      });
                    });
              })
              .catch((errs)=>{
                console.log(errs);
              });
        }).
        catch((err) => {
          console.log(err);
        });
  }
});

module.exports = router;
