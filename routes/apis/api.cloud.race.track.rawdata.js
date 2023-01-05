const express = require('express');
const router = express.Router();
const modelPostgresCloudRaceTrackRawdata = require('../../db/models.postgres.cloud/models.postgres.cloud.race.track.rawdata');
const modelPostgresCloudRacerank = require('../../db/models.postgres.cloud/models.postgres.cloud.race.rank');

router.post('/searchByRacerecordid', (req, res, next) => {
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
  if (!body['racerecordid']) {
    errors.push('No racerecordid specified');
  }
  if (errors.length) {
    console.log(errors);
    res.status(400).json({'error': errors.join(',')});
    return;
  }
  console.log(body['racerecordid']);
  modelPostgresCloudRaceTrackRawdata.searchByRaceRecordId(body['racerecordid'])
      .then((rows) => {
        res.json({
          'status': 'ok',
          'trackrawdata': rows,
        });
      })
      .catch((err) => {
        console.log(err);
        res.json({
          'status': 'failed',
        });
      });
});


router.post('/searchByRaceId', (req, res, next) => {
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
  if (!body['raceid']) {
    errors.push('No \']) specified');
  }
  if (errors.length) {
    console.log(errors);
    res.status(400).json({'error': errors.join(',')});
    return;
  }
  console.log(body['raceid']);
  // get all ranked racerecords
  modelPostgresCloudRacerank.searchByRaceId_limitbyrank(body['raceid'], 10)
      .then((rows) => {
        const racerecordlist = [];
        for (let i=0; i<rows.length; i++) {
          racerecordlist.push(rows[i]['racerecordid']);
        }
        console.log('racerecordlist : ', racerecordlist.length);
        modelPostgresCloudRaceTrackRawdata.searchByRaceRecordIdList_optimize(racerecordlist)
            .then((resTrackrawdata) =>{
              res.json({
                'status': 'success',
                'message': resTrackrawdata,
              });
            })
            .catch((errTrackrawdata) =>{
              console.log(errTrackrawdata);
              res.json({
                'status': 'failed',
                'message': errTrackrawdata,
              });
            });
      })
      .catch((err) => {
        console.log(err);
        res.json({
          'status': 'failed',
          'message': err,
        });
      });
});

module.exports = router;
