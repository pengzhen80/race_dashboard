const express = require('express');
const router = express.Router();
const modelPostgresLocalRaceRecordSlicer = require('../../db/models.postgres.local/models.postgres.local.race.record.slicer');
const modelPostgresCloudRacerank = require('../../db/models.postgres.cloud/models.postgres.cloud.race.rank');
const modelPostgresCloudRaceTrackRawdata = require('../../db/models.postgres.cloud/models.postgres.cloud.race.track.rawdata');
const modelPostgresCloudRaceinfo = require('../../db/models.postgres.cloud/models.postgres.cloud.raceinfo');
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
  if (!body['raceid']) {
    errors.push('No raceid specified');
  }
  if (errors.length) {
    console.log(errors);
    res.status(400).json({'error': errors.join(',')});
    return;
  }
  console.log(body['raceid']);
  modelPostgresLocalRaceRecordSlicer.searchrace(body['raceid'])
      .then((rows) => {
        res.json({
          'status': 'ok',
          'racerecordslicer': rows,
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
  modelPostgresCloudRacerank.searchByRaceId_limitbyrank(body['raceid'],100)
      .then((rows) => {
        const racerecordlist = [];
        for (let i=0; i<rows.length; i++) {
          racerecordlist.push(rows[i]['racerecordid']);
        }
        console.log('racerecordlist : ', racerecordlist.length);
        modelPostgresCloudRaceTrackRawdata.searchByRaceRecordIdListOptimize(racerecordlist)
            .then((resTrackrawdata) =>{
              console.log(typeof(resTrackrawdata));
              modelPostgresCloudRaceinfo.searchByRaceId(body['raceid'])
                  .then((rowsRaceinfo) => {
                    modelPostgresLocalRaceRecordSlicer.addrace(body['raceid'],rowsRaceinfo,resTrackrawdata,10);
                  })
                  .catch((errRaceInfo) => {
                    console.log(errRaceInfo);
                    res.json({
                      'status': 'failed',
                    });
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
