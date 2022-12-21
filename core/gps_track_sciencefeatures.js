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
function splicer_straightAndRouteEff(raceinfo,tracks)
{
      //get totaldistance
      const turf = require('@turf/turf');
      var raceStartPoint = turf.point([raceinfo['start_lon'], raceinfo['start_lat']]);
      var raceEndPoint = turf.point([raceinfo['end_lon'], raceinfo['end_lat']]);
      var race_totaldistance = turf.distance(raceStartPoint,raceEndPoint);
      //make timeslicerlist by race_totaldistance:50km is 1h; 
      const raceStartTime = new Date(raceinfo['starttime']);
      console.log(race_totaldistance);
      const timesSlicer = Math.floor(race_totaldistance/50);
      let timesSlicer_list = [];
      for(var i=1;i<timesSlicer;i++)
      {
          var tmp_date = new Date();
          tmp_date.setTime(raceStartTime.getTime() + i * 60 * 60 * 1000);
          timesSlicer_list.push(tmp_date);
      }
      console.log(timesSlicer,timesSlicer_list);
      //make track dashbaord by timesSlicer_list
      let rowForDashboard_list = [];
      for(var i=0;i<tracks.length;i++)
      {
          var rowForDashboard = {};
          rowForDashboard['gpxfilename'] = tracks[i]['name'];
          const[straightspeed,routeefficiency] = dashboard(tracks[i]['data']);
          rowForDashboard['straightspeed'] = straightspeed;
          rowForDashboard['routeefficiency'] = routeefficiency;
          rowForDashboard_list.push(rowForDashboard);
      }
      return rowForDashboard_list;
     
      //track:list(object)
      //object:{'lon'(real),'lat'(real),'time'(string),'distance'(real)}
      function dashboard(track)
      {
          var dash_straightSpeed = [];
          var dash_realtimeRouteEfficiency = [];

          var pickedPoints = [];
          var picked_flyedDistance = [];
          var test_picked_flyedDistance = [];
          var total_flyDistance = 0;
          var test_total_flyDistance = 0;
          var picker_count = 0;
          var picker_time = timesSlicer_list[picker_count];
          console.log('track.length',track.length);
          // if(track.length == 0)
          // {
          //     return [null,null];
          // }
          for(var i=1;i<track.length-1;i++)
          {
              var curTime = new Date(track[i]['time']);

              var curPoint = turf.point([track[i]['lon'], track[i]['lat']]);
              var lastPoint =  turf.point([track[i-1]['lon'], track[i-1]['lat']]);
              var distance = track[i]['distance'];
              total_flyDistance+=distance;
              // var dis = turf.distance(lastPoint,curPoint);
              // test_total_flyDistance+= dis*1000;
              // console.log(distance - dis*1000);
              // console.log()
              if(curTime == picker_time)
              {
                  console.log(curTime,picker_time,(total_flyDistance/1000).toFixed(3));
                  pickedPoints.push(track[i]);
                  picked_flyedDistance.push(total_flyDistance);
                  picker_count++;
                  if(picker_count == timesSlicer_list.length)
                  {
                      break;
                  }
                  picker_time = timesSlicer_list[picker_count];
              }
              else
              {
                  var nextTime = new Date(track[i+1]['time']);
                  if(curTime < picker_time && nextTime> picker_time)
                  {
                      // console.log(curTime,picker_time,(total_flyDistance/1000).toFixed(3));
                      // console.log(curTime,nextTime,picker_time);
                      var cur_dif = picker_time - curTime;
                      var next_dif = picker_time - nextTime;
                      if(cur_dif<next_dif)
                      {
                          pickedPoints.push(track[i]);
                          picked_flyedDistance.push(total_flyDistance);
                          picker_count++;
                          if(picker_count == timesSlicer_list.length)
                          {
                              break;
                          }
                          picker_time = timesSlicer_list[picker_count];
                      }
                      else
                      {
                          pickedPoints.push(track[i+1]);
                          var next_distance = track[i+1]['distance'];
                          picked_flyedDistance.push((total_flyDistance+next_distance));
                          picker_count++;
                          if(picker_count == timesSlicer_list.length)
                          {
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
          for(var i=0;i<pickedPoints.length;i++)
          {
              var curPoint = pickedPoints[i];
              curPoint = turf.point([curPoint['lon'], curPoint['lat']]);
              var leftdistance = turf.distance(curPoint,raceEndPoint);
              var testdistance = turf.distance(curPoint,raceStartPoint);

              var curTime = new Date(pickedPoints[i]['time']);
              var time_diff = curTime.getTime() - raceStartTime.getTime();
              // console.log(time_diff);
              time_diff = (time_diff/1000)/3600;
              var straightspeed = (race_totaldistance-leftdistance)/time_diff;
              // console.log(picked_flyedDistance[i]/1000);
              var realtime_routeEff = (race_totaldistance-leftdistance)/(picked_flyedDistance[i]/1000);

              dash_straightSpeed.push(straightspeed.toFixed(3));
              dash_realtimeRouteEfficiency.push(realtime_routeEff.toFixed(3));
          }
          // console.log(dash_straightSpeed.length,dash_realtimeRouteEfficiency.length);
          //trans array to string with ','
          var str_dash_straightSpeed = '';
          var str_dash_realtimeRouteEfficiency = '';
          for(var i=0;i<dash_straightSpeed.length-1;i++)
          {
              str_dash_straightSpeed += (dash_straightSpeed[i].toString()+',');
              str_dash_realtimeRouteEfficiency += (dash_realtimeRouteEfficiency[i].toString()+',')
          }
          if(dash_straightSpeed.length>1)
          {
              str_dash_straightSpeed += dash_straightSpeed[dash_straightSpeed.length-1].toString();
              str_dash_realtimeRouteEfficiency += dash_realtimeRouteEfficiency[dash_realtimeRouteEfficiency.length-1].toString();
          }
          console.log(dash_realtimeRouteEfficiency);
          return [str_dash_straightSpeed,str_dash_realtimeRouteEfficiency];
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
    for(var i=0;i<normalized_multiroutes.length-1;i++)
    {
        var base_route = normalized_multiroutes[i];
        // var baseLine = turf.lineString(base_route);
        for(var j=i+1;j<normalized_multiroutes.length;j++)
        {
            var cur_route = normalized_multiroutes[j];
            // var distance_point_toBaseLine = func_routeSimilarity_calculateByTurf(base_route,cur_route);
            var distance_point_toBaseLine = func_routeSimilarity_calculateByPointToNearByPoint(base_route,cur_route);
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
    function func_routeSimilarity_calculateByTurf(route_base,route_comparator)
    {
        var baseLine = turf.lineString(route_base);
            // console.log(cur_route.join());
        var distance_point_toBaseLine = [];
        for (var j = 0; j < route_comparator.length; j++) {
            var pt = turf.point(route_comparator[j]);
            var distanceToLine = turf.pointToLineDistance(pt, baseLine, {units: 'kilometers'});
            // console.log(j,cur_route[j],distanceToLine);
            distance_point_toBaseLine.push(parseFloat(distanceToLine.toFixed(3)));
        }
        return distance_point_toBaseLine;
    }
    // console.log(distance_point_toBaseLine_multi);

    //another distance of two route's formula : distance from point to line is to nearest point. 
    function func_routeSimilarity_calculateByPointToNearByPoint(route_base,route_comparator)
    {

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

        function func_distance_pointToRoute(param_point,param_route)
        {
            var min_distance = turf.distance(param_point, turf.point(param_route[0]), {units: 'kilometers'});
            for(var i_r=1;i_r<param_route.length;i_r++)
            {
                  var to_point = turf.point(param_route[i_r]);
                  var dis = turf.distance(param_point, to_point, {units: 'kilometers'});
                  if(dis<min_distance)
                  {
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
function multiRoutes_routeSimilarity_allCombination_returnAvgTrackDistance(tracks)
{
    var rowForRouteSimilarity_list = multiRoutes_routeSimilarity_allCombination(tracks);
    var avg_rowForRouteSimilarity_list = [];
    for(var i=0;i<rowForRouteSimilarity_list.length;i++)
    {
        var avg_rowForRouteSimilarity = {};
        avg_rowForRouteSimilarity['gpxfilename_base'] = rowForRouteSimilarity_list[i]['gpxfilename_base'];
        avg_rowForRouteSimilarity['gpxfilename_comparator'] = rowForRouteSimilarity_list[i]['gpxfilename_comparator'];
        avg_rowForRouteSimilarity['avg_track_distance'] = makeAvg(rowForRouteSimilarity_list[i]['routeSimilarity']);
        avg_rowForRouteSimilarity_list.push(avg_rowForRouteSimilarity);
    }
    return avg_rowForRouteSimilarity_list;

    function makeAvg(dataList)
    {

        if(dataList.length == 0)
        {
            return 0;
        }
        var total = 0;
        for(var i=0;i<dataList.length;i++)
        {
            total += dataList[i];
        }
        // console.log('dataList.length',dataList.length,total,total/dataList.length,dataList[0]);
        return (total/dataList.length).toFixed(3);
    }
}


module.exports.splicer_straightAndRouteEff = splicer_straightAndRouteEff;
module.exports.multiRoutes_routeSimilarity_allCombination = multiRoutes_routeSimilarity_allCombination;
module.exports.multiRoutes_routeSimilarity_allCombination_returnAvgTrackDistance = multiRoutes_routeSimilarity_allCombination_returnAvgTrackDistance;