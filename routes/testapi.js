var express = require('express');
var router = express.Router();
// var bodyParser = require("body-parser");

var api_db_race_track_summaryFeatures = require("./apis/api.db.race.track.summaryFeatures");

// router.use(bodyParser.text({type:'*/*'}));
router.use('/race_track_summaryFeatures', api_db_race_track_summaryFeatures);

module.exports = router;
