const express = require('express');
const router = express.Router();
const modelPostgresCloudRacerank = require('../../db/models.postgres.cloud/models.postgres.cloud.race.rank');

// router.get("/allrace", (req, res, next) => {
//     var errors = [];
//     model_postgres_local_raceinfo.searchAllRace()
//         .then(rows => {
//             res.json({
//                 'status': 'ok',
//                 'allrace': rows
//             });
//         })
//         .catch(err => {
//             console.log(err);
//             res.json({
//                 'status': 'failed'
//             });
//         })
// });

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
  modelPostgresCloudRacerank.searchByRaceId(body['raceid'])
      .then((rows) => {
        res.json({
          'status': 'ok',
          'allrace': rows,
        });
      })
      .catch((err) => {
        console.log(err);
        res.json({
          'status': 'failed',
        });
      });
});


module.exports = router;