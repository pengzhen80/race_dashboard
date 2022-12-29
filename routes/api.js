var express = require('express');
var router = express.Router();

// var bodyParser = require("body-parser");
// var apiRouter_raceinfo = require("./abandons/api_raceinfo");
var apiRouter_tracks = require("./apis/api_tracks");
// var apiRouter_initdb_racedashboard = require("./apis/api.initdb.racedashboard");
var api_db_race_track_summaryFeatures = require("./apis/api.db.race.track.summaryFeatures");
var apiRouter_race_track_dashboard = require("./apis/api.race.track.dashboard");
var apiRouter_race_tracks_routeSimilarity = require("./apis/api.race.tracks.routeSimilarity");
var apiRoute_raceinfo = require("./apis/api.raceinfo");
var apiRoute_racerank = require("./apis/api.race.rankinfo");
var apiRoute_race_track_rawdata = require("./apis/api.race.track.rawdata");

router.use('/tracks', apiRouter_tracks);
router.use('/rack_track_dashboard', apiRouter_race_track_dashboard);
router.use('/race_track_summaryFeatures', api_db_race_track_summaryFeatures);
router.use('/race_tracks_routeSimilarity', apiRouter_race_tracks_routeSimilarity);
router.use('/raceinfo', apiRoute_raceinfo);
router.use('/racerank', apiRoute_racerank);
router.use('/race_track_rawdata', apiRoute_race_track_rawdata);

module.exports = router;
