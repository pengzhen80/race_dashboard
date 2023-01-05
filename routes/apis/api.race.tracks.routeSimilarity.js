const express = require('express');
const router = express.Router();
const modelRaceRank = require('../../db/models_sqlites/models.sqlites.race.rank');
const modelRaceGpxfilesRows = require('../../db/models_sqlites/models.sqlites.race.gpxfiles.rows');
const modelRaceTracksRouteSimilarity = require('../../db/models_sqlites/models.sqlites.race.tracks.routeSimilarity');
const modelRaceTrackSummaryfeatures= require('../../db/models_sqlites/models.sqlites.race.track.summaryFeatures');

router.post('/addrace', (req, res, next) => {
  const errors=[];
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

  const resTracks = [];
  modelRaceRank.searchByRacename_rankLimit(body['racename'], 101)
      .then((rows) =>{
        initTrackDatas(rows);
        initTrackRawData();
      })
      .catch((errs)=>{
        console.log(errs);
      });

  /**
   *
   * @param {object[]}rows tracks' rank info
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
    const trackNameList = [];
    for (let i=0; i<resTracks.length; i++) {
      trackNameList.push(resTracks[i]['name']);
    }
    modelRaceGpxfilesRows.searchByGpxfilenameList(trackNameList)
        .then((values) => {
          for (i=0; i<values.length; i++) {
            resTracks[i]['data'] = values[i];
          }

          modelRaceTracksRouteSimilarity.insertrace(body['racename'], resTracks)
              .then((rows) => {
                const end = Date.now();
                console.log('time need(s):', (end-start)/1000);
                res.json({
                  'status': 'ok',
                });
              })
              .catch((errs) => {
                const end = Date.now();
                console.log('time need(s):', (end-start)/1000);
                res.json({
                  'status': 'fail',
                  'message': errs,
                });
              });
        })
        .catch((errs) => {
          console.log(errs);
        });
  }
});

router.post('/searchrace', (req, res, next) => {
  const errors=[];
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
  modelRaceTracksRouteSimilarity.searchrace(body['racename'])
      .then((rows) => {
        // get all track realspeed and rank
        const trackNameList = [];
        for (let i=0; i<rows.length; i++) {
          const gpxfilenameBase = rows[i]['gpxfilenameBase'];
          const gpxfilenameComparator = rows[i]['gpxfilenameComparator'];
          if (!trackNameList.includes(gpxfilenameBase)) {
            trackNameList.push(gpxfilenameBase);
          }
          if (!trackNameList.includes(gpxfilenameComparator)) {
            trackNameList.push(gpxfilenameComparator);
          }
        }

        modelRaceRank.searchByGpxfilenameList(trackNameList)
            .then((rowsRanks)=>{
              modelRaceTrackSummaryfeatures.searchByGpxfilenameList(trackNameList)
                  .then((rowsSummary)=>{
                    const resTrackInfoList = [];

                    for (let i=0; i<trackNameList.length; i++) {
                      const resTrackInfo = {};
                      resTrackInfo['trackname'] = trackNameList[i];
                      resTrackInfo['rank'] = rowsRanks[i][0]['rank'];
                      resTrackInfo['realspeed'] = rowsSummary[i][0]['realspeed'];
                      resTrackInfoList.push(resTrackInfo);
                    }
                    console.log(rowsRanks);
                    console.log(resTrackInfoList);
                    res.json({
                      'status': 'ok',
                      'trackinfo': resTrackInfoList,
                      'race_tracks_routeSimilarity': rows,
                    });
                  })
                  .catch((errSummary)=>{
                    console.log(errSummary);
                    res.json({
                      'status': 'fail',
                      'message': errSummary,
                    });
                  });
            })
            .catch((errRanks)=>{
              console.log(errRanks);
              res.json({
                'status': 'fail',
                'message': errRanks,
              });
            });


        // res.json({
        //     'status':'ok',
        //     'race_tracks_routeSimilarity':rows
        // });
      })
      .catch((err)=> {
        console.log(err);
        res.json({
          'status': 'failed',
        });
      });
});

module.exports = router;
