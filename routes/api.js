const express = require('express');
const router = express.Router();

// var bodyParser = require("body-parser");
// var apiRouter_raceinfo = require("./abandons/api_raceinfo");
const apiRouterTracks = require('./apis/api_tracks');
// var apiRouter_initdb_racedashboard = require("./apis/api.initdb.racedashboard");
const apiDbRaceTrackSummaryFeatures = require('./apis/api.db.race.track.summaryFeatures');
const apiRouterRaceTrackDashboard = require('./apis/api.race.track.dashboard');
const apiRouterRaceTracksRouteSimilarity = require('./apis/api.race.tracks.routeSimilarity');
const apiRouteRaceinfo = require('./apis/api.cloud.race.raceinfo');
const apiRouteRacerank = require('./apis/api.cloud.race.rankinfo');
const apiRouteRaceTrackRawdata = require('./apis/api.cloud.race.track.rawdata');
const apiRouteRaceRecordScienceSummary = require('./apis/api.cloud.race.record.scienceSummary');

router.use('/tracks', apiRouterTracks);
router.use('/rack_track_dashboard', apiRouterRaceTrackDashboard);
router.use('/race_track_summaryFeatures', apiDbRaceTrackSummaryFeatures);
router.use('/race_tracks_routeSimilarity', apiRouterRaceTracksRouteSimilarity);
router.use('/raceinfo', apiRouteRaceinfo);
router.use('/racerank', apiRouteRacerank);
router.use('/race_track_rawdata', apiRouteRaceTrackRawdata);
router.use('/race_track_sciencysummary', apiRouteRaceRecordScienceSummary);

module.exports = router;
