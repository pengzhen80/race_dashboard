//lib:turf,

/////////////////format: param_name(param_type)
//input
//params:raceinfo(object),tracks(list)
//raceinfo:{'starttime'(string),'start_lon'(real),'start_lat'(real),'end_lon'(real),'end_lat'(real)}
//tracks:list(object)
//track object:{'name'(string),'data'(list(object))}
//track data object:{'lon'(real),'lat'(real),'time'(string),'distance'(real)}
/////////////////
//return:[str_dash_straightSpeed(list to string,parser is ','),str_dash_realtimeRouteEfficiency(list to string,parser is ',')];
function splicer_straightAndRouteEff(raceinfo, tracks) {
    //get totaldistance
    const turf = require('@turf/turf');
    var raceStartPoint = turf.point([raceinfo['start_lon'], raceinfo['start_lat']]);
    var raceEndPoint = turf.point([raceinfo['end_lon'], raceinfo['end_lat']]);
    var race_totaldistance = turf.distance(raceStartPoint, raceEndPoint);
    //make timeslicerlist by race_totaldistance:50km is 1h; 
    const raceStartTime = new Date(raceinfo['starttime']);
    console.log(race_totaldistance);
    const timesSlicer = Math.floor(race_totaldistance / 50);
    let timesSlicer_list = [];
    for (var i = 1; i < timesSlicer; i++) {
        var tmp_date = new Date();
        tmp_date.setTime(raceStartTime.getTime() + i * 60 * 60 * 1000);
        timesSlicer_list.push(tmp_date);
    }
    console.log(timesSlicer, timesSlicer_list);
    //make track dashbaord by timesSlicer_list
    let rowForDashboard_list = [];
    for (var i = 0; i < tracks.length; i++) {
        var rowForDashboard = {};
        rowForDashboard['gpxfilename'] = tracks[i]['name'];
        const [straightspeed, routeefficiency] = dashboard(tracks[i]['data']);
        rowForDashboard['straightspeed'] = straightspeed;
        rowForDashboard['routeefficiency'] = routeefficiency;
        rowForDashboard_list.push(rowForDashboard);
    }
    return rowForDashboard_list;

    //track:list(object)
    //object:{'lon'(real),'lat'(real),'time'(string),'distance'(real)}
    function dashboard(track) {
        var dash_straightSpeed = [];
        var dash_realtimeRouteEfficiency = [];

        var pickedPoints = [];
        var picked_flyedDistance = [];
        var test_picked_flyedDistance = [];
        var total_flyDistance = 0;
        var test_total_flyDistance = 0;
        var picker_count = 0;
        var picker_time = timesSlicer_list[picker_count];
        console.log('track.length', track.length);
        // if(track.length == 0)
        // {
        //     return [null,null];
        // }
        for (var i = 1; i < track.length - 1; i++) {
            var curTime = new Date(track[i]['time']);

            var curPoint = turf.point([track[i]['lon'], track[i]['lat']]);
            var lastPoint = turf.point([track[i - 1]['lon'], track[i - 1]['lat']]);
            var distance = track[i]['distance'];
            total_flyDistance += distance;
            // var dis = turf.distance(lastPoint,curPoint);
            // test_total_flyDistance+= dis*1000;
            // console.log(distance - dis*1000);
            // console.log()
            if (curTime == picker_time) {
                console.log(curTime, picker_time, (total_flyDistance / 1000).toFixed(3));
                pickedPoints.push(track[i]);
                picked_flyedDistance.push(total_flyDistance);
                picker_count++;
                if (picker_count == timesSlicer_list.length) {
                    break;
                }
                picker_time = timesSlicer_list[picker_count];
            }
            else {
                var nextTime = new Date(track[i + 1]['time']);
                if (curTime < picker_time && nextTime > picker_time) {
                    // console.log(curTime,picker_time,(total_flyDistance/1000).toFixed(3));
                    // console.log(curTime,nextTime,picker_time);
                    var cur_dif = picker_time - curTime;
                    var next_dif = picker_time - nextTime;
                    if (cur_dif < next_dif) {
                        pickedPoints.push(track[i]);
                        picked_flyedDistance.push(total_flyDistance);
                        picker_count++;
                        if (picker_count == timesSlicer_list.length) {
                            break;
                        }
                        picker_time = timesSlicer_list[picker_count];
                    }
                    else {
                        pickedPoints.push(track[i + 1]);
                        var next_distance = track[i + 1]['distance'];
                        picked_flyedDistance.push((total_flyDistance + next_distance));
                        picker_count++;
                        if (picker_count == timesSlicer_list.length) {
                            break;
                        }
                        picker_time = timesSlicer_list[picker_count];
                    }
                }
            }
        }
        // console.log(pickedPoints.length);
        // console.log(test_total_flyDistance,total_flyDistance);
        //get dashboard datas
        for (var i = 0; i < pickedPoints.length; i++) {
            var curPoint = pickedPoints[i];
            curPoint = turf.point([curPoint['lon'], curPoint['lat']]);
            var leftdistance = turf.distance(curPoint, raceEndPoint);
            var testdistance = turf.distance(curPoint, raceStartPoint);

            var curTime = new Date(pickedPoints[i]['time']);
            var time_diff = curTime.getTime() - raceStartTime.getTime();
            // console.log(time_diff);
            time_diff = (time_diff / 1000) / 3600;
            var straightspeed = (race_totaldistance - leftdistance) / time_diff;
            // console.log(picked_flyedDistance[i]/1000);
            var realtime_routeEff = (race_totaldistance - leftdistance) / (picked_flyedDistance[i] / 1000);

            dash_straightSpeed.push(straightspeed.toFixed(3));
            dash_realtimeRouteEfficiency.push(realtime_routeEff.toFixed(3));
        }
        // console.log(dash_straightSpeed.length,dash_realtimeRouteEfficiency.length);
        //trans array to string with ','
        var str_dash_straightSpeed = '';
        var str_dash_realtimeRouteEfficiency = '';
        for (var i = 0; i < dash_straightSpeed.length - 1; i++) {
            str_dash_straightSpeed += (dash_straightSpeed[i].toString() + ',');
            str_dash_realtimeRouteEfficiency += (dash_realtimeRouteEfficiency[i].toString() + ',')
        }
        if (dash_straightSpeed.length > 1) {
            str_dash_straightSpeed += dash_straightSpeed[dash_straightSpeed.length - 1].toString();
            str_dash_realtimeRouteEfficiency += dash_realtimeRouteEfficiency[dash_realtimeRouteEfficiency.length - 1].toString();
        }
        console.log(dash_realtimeRouteEfficiency);
        return [str_dash_straightSpeed, str_dash_realtimeRouteEfficiency];
    }
}


/////////////////format: param_name(param_type)
//input
//params:tracks(list)
//tracks:list(object)
//track object:{'name'(string),'data'(list(object))}
//track data object:{'lon'(real),'lat'(real),'time'(string),'distance'(real)}
///////////////
//return:rowForRouteSimilarity_list(list(object))
//object:{'gpxfilename_base'(string),'gpxfilename_comparator'(string),'routeSimilarity'(list(real))}
function multiRoutes_routeSimilarity_allCombination(tracks) {
    const turf = require('@turf/turf');

    //normalize tracks: only need {'lon'(real),'lat'(real)}
    var normalized_multiroutes = [];
    for (var i = 0; i < tracks.length; i++) {
        var normalized_route = [];
        for (var j = 0; j < tracks[i]['data'].length; j++) {
            normalized_route.push([tracks[i]['data'][j]['lon'], tracks[i]['data'][j]['lat']]);
        }
        normalized_multiroutes.push(normalized_route);
    }
    console.log(normalized_multiroutes.length);

    let rowForRouteSimilarity_list = [];
    for (var i = 0; i < normalized_multiroutes.length - 1; i++) {
        var base_route = normalized_multiroutes[i];
        // var baseLine = turf.lineString(base_route);
        for (var j = i + 1; j < normalized_multiroutes.length; j++) {
            var cur_route = normalized_multiroutes[j];
            // var distance_point_toBaseLine = func_routeSimilarity_calculateByTurf(base_route,cur_route);
            var distance_point_toBaseLine = func_routeSimilarity_calculateByPointToNearByPoint(base_route, cur_route);
            var RouteSimilarity = {};
            RouteSimilarity['gpxfilename_base'] = tracks[i]['name'];
            RouteSimilarity['gpxfilename_comparator'] = tracks[j]['name'];
            RouteSimilarity['routeSimilarity'] = distance_point_toBaseLine;
            rowForRouteSimilarity_list.push(RouteSimilarity);
        }
    }

    return rowForRouteSimilarity_list;

    //distance of between tracks(by index, e:0 vs 1,1 vs 2 ,i vs i-1,...) 
    //distance from point to line is to nearest distance calculated by turf.pointToLineDistance
    function func_routeSimilarity_calculateByTurf(route_base, route_comparator) {
        var baseLine = turf.lineString(route_base);
        // console.log(cur_route.join());
        var distance_point_toBaseLine = [];
        for (var j = 0; j < route_comparator.length; j++) {
            var pt = turf.point(route_comparator[j]);
            var distanceToLine = turf.pointToLineDistance(pt, baseLine, { units: 'kilometers' });
            // console.log(j,cur_route[j],distanceToLine);
            distance_point_toBaseLine.push(parseFloat(distanceToLine.toFixed(3)));
        }
        return distance_point_toBaseLine;
    }
    // console.log(distance_point_toBaseLine_multi);

    //another distance of two route's formula : distance from point to line is to nearest point. 
    function func_routeSimilarity_calculateByPointToNearByPoint(route_base, route_comparator) {

        var distance_point_toBaseLine = [];
        for (var i = 0; i < route_comparator.length; i++) {
            var pt = turf.point(route_comparator[i]);
            // console.log(cur_route[j]);
            //distance to baseline
            // var distanceToLine = turf.pointToLineDistance(pt, baseLine, {units: 'kilometers'});
            var distanceToLine = func_distance_pointToRoute(pt, route_base);
            // console.log(j,cur_route[j],distanceToLine);
            distance_point_toBaseLine.push(parseFloat(distanceToLine.toFixed(3)));
        }
        return distance_point_toBaseLine;

        function func_distance_pointToRoute(param_point, param_route) {
            var min_distance = turf.distance(param_point, turf.point(param_route[0]), { units: 'kilometers' });
            for (var i_r = 1; i_r < param_route.length; i_r++) {
                var to_point = turf.point(param_route[i_r]);
                var dis = turf.distance(param_point, to_point, { units: 'kilometers' });
                if (dis < min_distance) {
                    min_distance = dis;
                }
            }
            return min_distance;
        }
    }
}


/////////////////format: param_name(param_type)
//input
//params:tracks(list)
//tracks:list(object)
//track object:{'name'(string),'data'(list(object))}
//track data object:{'lon'(real),'lat'(real),'time'(string),'distance'(real)}
///////////////
//return:avg_rowForRouteSimilarity_list(list(object))
//object:{'gpxfilename_base'(string),'gpxfilename_comparator'(string),'routeSimilarity'(list(real))}
function multiRoutes_routeSimilarity_allCombination_returnAvgTrackDistance(tracks) {
    var rowForRouteSimilarity_list = multiRoutes_routeSimilarity_allCombination(tracks);
    var avg_rowForRouteSimilarity_list = [];
    for (var i = 0; i < rowForRouteSimilarity_list.length; i++) {
        var avg_rowForRouteSimilarity = {};
        avg_rowForRouteSimilarity['gpxfilename_base'] = rowForRouteSimilarity_list[i]['gpxfilename_base'];
        avg_rowForRouteSimilarity['gpxfilename_comparator'] = rowForRouteSimilarity_list[i]['gpxfilename_comparator'];
        avg_rowForRouteSimilarity['avg_track_distance'] = makeAvg(rowForRouteSimilarity_list[i]['routeSimilarity']);
        avg_rowForRouteSimilarity_list.push(avg_rowForRouteSimilarity);
    }
    return avg_rowForRouteSimilarity_list;

    function makeAvg(dataList) {

        if (dataList.length == 0) {
            return 0;
        }
        var total = 0;
        for (var i = 0; i < dataList.length; i++) {
            total += dataList[i];
        }
        // console.log('dataList.length',dataList.length,total,total/dataList.length,dataList[0]);
        return (total / dataList.length).toFixed(3);
    }
}

/////////////////format: param_name(param_type)
//input
//params:raceinfo(object),tracks(list)
//raceinfo:{'racename'(string),'starttime'(string),'start_lon'(real),'start_lat'(real),'end_lon'(real),'end_lat'(real)}
//tracks:list(object)
//track object:{'name'(string),'data'(list(object)),'arrivingtime'(string)}
//track data object:{'lon'(real),'lat'(real),'time'(string),'distance'(real),'ele'(real)}
/////////////////
//return:rowForSummaryFeatures_list(list(object))
//return:object:{'racename'(string),'gpxfilename'(string),'straightspeed'(real),'realspeed'(real),'realdistance'(real),'avgelevation'(real),'routeefficiency'(real)}
function race_makeSummaryFeatures(raceinfo, tracks) {
    //get totaldistance
    const turf = require('@turf/turf');
    var raceStartPoint = turf.point([raceinfo['start_lon'], raceinfo['start_lat']]);
    var raceEndPoint = turf.point([raceinfo['end_lon'], raceinfo['end_lat']]);
    var race_totaldistance = turf.distance(raceStartPoint, raceEndPoint);
    var raceStartTime = new Date(raceinfo['starttime']);

    //make track dashbaord by timesSlicer_list
    let rowForSummaryFeatures_list = [];
    for (var i = 0; i < tracks.length; i++) {
        var rowForSummaryFeatures = {};
        rowForSummaryFeatures['racename'] = raceinfo['racename'];
        rowForSummaryFeatures['gpxfilename'] = tracks[i]['name'];
        const [res_straightspeed, res_realspeed, res_realdistance, res_avgelevation, res_routeefficiency] = summaryFeatures(tracks[i]['arrivingtime'], tracks[i]['data']);
        rowForSummaryFeatures['straightspeed'] = res_straightspeed;
        rowForSummaryFeatures['realspeed'] = res_realspeed;
        rowForSummaryFeatures['realdistance'] = res_realdistance;
        rowForSummaryFeatures['avgelevation'] = res_avgelevation;
        rowForSummaryFeatures['routeefficiency'] = res_routeefficiency;
        rowForSummaryFeatures_list.push(rowForSummaryFeatures);
    }

    return rowForSummaryFeatures_list;

    function summaryFeatures(arrivingtime, track) {
        var res_straightspeed;
        var res_realspeed;
        var res_realdistance = 0;
        var res_avgelevation;
        var res_routeefficiency;
        //get real total distance
        var totalelevation = 0;
        for (var i = 0; i < track.length; i++) {
            var distance = (track[i]['distance'] / 1000);
            res_realdistance += distance;
            totalelevation += track[i]['ele'];
        }
        //get time
        var endTime = new Date(arrivingtime);
        var timeSpend = (endTime.getTime() - raceStartTime.getTime()) / (1000 * 3600);
        //get straight speed
        try {
            res_straightspeed = race_totaldistance / timeSpend;
        }
        catch (err) {
            console.log(err);
            res_straightspeed = 0;
        }
        //get res_realspeed
        try {
            res_realspeed = res_realdistance / timeSpend;
        }
        catch (err) {
            console.log(err);
            res_realspeed = 0;
        }
        //get res_avgelevation
        try {
            res_avgelevation = totalelevation / track.length;
        }
        catch (err) {
            console.log(err);
            res_avgelevation = 0;
        }
        //get res_routeefficiency
        try {
            res_routeefficiency = race_totaldistance / res_realdistance;
        }
        catch (err) {
            console.log(err);
            res_routeefficiency = 0;
        }
        // console.log([res_straightspeed,res_realspeed,res_realdistance,res_avgelevation,res_routeefficiency]);
        return [res_straightspeed.toFixed(3), res_realspeed.toFixed(3), res_realdistance.toFixed(3), res_avgelevation.toFixed(3), res_routeefficiency.toFixed(3)];
    }
}

/////////////////format: param_name(param_type)
//input
//params:raceinfo(object),tracks(list)
//raceinfo:{'raceid'(string),'starttime'(string),'start_lon'(real),'start_lat'(real),'end_lon'(real),'end_lat'(real)}
//tracks:list(object)
//track object:{'racerecordid'(string),'data'(list(object)),'arrivingtime'(string)}
//track data object:{'lon'(real),'lat'(real),'time'(string),'distance'(real),'ele'(real)}
/////////////////
//return:rowForSummaryFeatures_list(list(object))
//return:object:{'racename'(string),'gpxfilename'(string),'straightspeed'(real),'realspeed'(real),'realdistance'(real),'avgelevation'(real),'routeefficiency'(real)}
function race_cloud_makeSummaryFeatures(raceinfo, tracks) {
    //get totaldistance
    const turf = require('@turf/turf');
    var raceStartPoint = turf.point([raceinfo['start_lon'], raceinfo['start_lat']]);
    var raceEndPoint = turf.point([raceinfo['end_lon'], raceinfo['end_lat']]);
    var race_totaldistance = turf.distance(raceStartPoint, raceEndPoint);
    var raceStartTime = new Date(raceinfo['starttime']);

    //make track dashbaord by timesSlicer_list
    let rowForSummaryFeatures_list = [];
    for (var i = 0; i < tracks.length; i++) {
        var rowForSummaryFeatures = {};
        rowForSummaryFeatures['raceid'] = raceinfo['raceid'];
        rowForSummaryFeatures['racerecordid'] = tracks[i]['racerecordid'];
        const [res_straightspeed, res_realspeed, res_realdistance, res_avgelevation, res_routeefficiency] = summaryFeatures(tracks[i]['arrivingtime'], tracks[i]['data']);
        rowForSummaryFeatures['straightspeed'] = res_straightspeed;
        rowForSummaryFeatures['realspeed'] = res_realspeed;
        rowForSummaryFeatures['realdistance'] = res_realdistance;
        rowForSummaryFeatures['avgelevation'] = res_avgelevation;
        rowForSummaryFeatures['routeefficiency'] = res_routeefficiency;
        rowForSummaryFeatures_list.push(rowForSummaryFeatures);
    }

    return rowForSummaryFeatures_list;

    function summaryFeatures(arrivingtime, track) {
        var res_straightspeed;
        var res_realspeed;
        var res_realdistance = 0;
        var res_avgelevation;
        var res_routeefficiency;
        //get real total distance
        var totalelevation = 0;
        for (var i = 0; i < track.length; i++) {
            var distance = (track[i]['distance'] / 1000);
            res_realdistance += distance;
            totalelevation += track[i]['ele'];
        }
        //get time
        var endTime = new Date(arrivingtime);
        var timeSpend = (endTime.getTime() - raceStartTime.getTime()) / (1000 * 3600);
        //get straight speed
        try {
            res_straightspeed = race_totaldistance / timeSpend;
        }
        catch (err) {
            console.log(err);
            res_straightspeed = 0;
        }
        //get res_realspeed
        try {
            res_realspeed = res_realdistance / timeSpend;
        }
        catch (err) {
            console.log(err);
            res_realspeed = 0;
        }
        //get res_avgelevation
        try {
            res_avgelevation = totalelevation / track.length;
        }
        catch (err) {
            console.log(err);
            res_avgelevation = 0;
        }
        //get res_routeefficiency
        try {
            res_routeefficiency = race_totaldistance / res_realdistance;
        }
        catch (err) {
            console.log(err);
            res_routeefficiency = 0;
        }
        // console.log([res_straightspeed,res_realspeed,res_realdistance,res_avgelevation,res_routeefficiency]);
        return [res_straightspeed.toFixed(3), res_realspeed.toFixed(3), res_realdistance.toFixed(3), res_avgelevation.toFixed(3), res_routeefficiency.toFixed(3)];
    }
}

/////////////////format: param_name(param_type)
//input
//params:raceinfo(object),tracks(list)
//raceinfo:{'starttime'(string),'start_lon'(real),'start_lat'(real),'end_lon'(real),'end_lat'(real)}
//tracks:list(object)
//track object:{'name'(string),'data'(list(object)),'arrivingtime'(string)}
//track data object:{'lon'(real),'lat'(real),'time'(string),'distance'(real),'ele'(real)}
/////////////////
//return:tracks:list(object)
//track object:{'name'(string),'data'(list(object)),'arrivingtime'(string)}
//track data object:{'lon'(real),'lat'(real),'time'(string),'distance'(real)}

function track_make_withRaceEndpoint(raceinfo, tracks) {
    //get totaldistance
    const turf = require('@turf/turf');
    //raceinfo:{'starttime'(string),'start_lon'(real),'start_lat'(real),'end_lon'(real),'end_lat'(real)}
    //track object:{'name'(string),'data'(list(object)),'arrivingtime'(string)}
    //track data object:{'lon'(real),'lat'(real),'time'(string),'distance'(real)}
    for (var i = 0; i < tracks.length; i++) {
        var length = tracks[i]['data'].length;
        if (length < 1) {
            continue;
        }
        var startPoint = turf.point([tracks[i]['data'][length - 1]['lon'], tracks[i]['data'][length - 1]['lat']]);
        var endPoint = turf.point([raceinfo['end_lon'], raceinfo['end_lat']]);
        var fake_lastPoint = {
            'lon': raceinfo['end_lon'],
            'lat': raceinfo['end_lat'],
            'time': tracks[i]['arrivingtime'],
            'distance': turf.distance(startPoint, endPoint) * 1000,
            'ele':tracks[i]['data'][length-1]['ele']
        };
       

        tracks[i]['data'].push(fake_lastPoint);
    }
    return tracks;
}

/////////////////format: param_name(param_type)
//input
//params:raceRecordSummary_list(list(object))
//object:{straightdistance(real),straightspeed(real),realdistance(real),realspeed(real)}
/////////////////
//science_returnraceRecordSummary_list(list(object))
//object:{straightdistance(real),straightspeed(real),realdistance(real),realspeed(real),routeefficiency(real)}

function science_race_recordSummary_addRouteEfficiency(raceRecordSummary_list) {
    //get totaldistance
    var science_returnraceRecordSummary_list = [];
    for(var i=0;i<raceRecordSummary_list.length;i++)
    {
        if(raceRecordSummary_list[i]['straightdistance']&&raceRecordSummary_list[i]['realdistance'])
        {
            if(raceRecordSummary_list[i]['realdistance'] != 0)
            {
                raceRecordSummary_list[i]['routeefficiency'] = raceRecordSummary_list[i]['straightdistance']/raceRecordSummary_list[i]['realdistance'];
                science_returnraceRecordSummary_list.push(raceRecordSummary_list[i]);
            }
            else
            {
                raceRecordSummary_list[i]['routeefficiency'] = 0;
                science_returnraceRecordSummary_list.push(raceRecordSummary_list[i]);
            }
        }
        else
        {
            raceRecordSummary_list[i]['routeefficiency'] = 0;
            science_returnraceRecordSummary_list.push(raceRecordSummary_list[i]);
        }
    }

    return science_returnraceRecordSummary_list;
}

module.exports.splicer_straightAndRouteEff = splicer_straightAndRouteEff;
module.exports.multiRoutes_routeSimilarity_allCombination = multiRoutes_routeSimilarity_allCombination;
module.exports.multiRoutes_routeSimilarity_allCombination_returnAvgTrackDistance = multiRoutes_routeSimilarity_allCombination_returnAvgTrackDistance;
module.exports.race_makeSummaryFeatures = race_makeSummaryFeatures;
module.exports.track_make_withRaceEndpoint = track_make_withRaceEndpoint;
module.exports.science_race_recordSummary_addRouteEfficiency = science_race_recordSummary_addRouteEfficiency;
module.exports.race_cloud_makeSummaryFeatures = race_cloud_makeSummaryFeatures;