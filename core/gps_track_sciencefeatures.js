//lib:turf,

//params:raceinfo(object),track(list)
//raceinfo:{'starttime'(string),'start_lon'(real),'start_lat'(real),'end_lon'(real),'end_lat'(real)}
//track:list(object)
//object:{'lon'(real),'lat'(real),'time'(string),'distance'(real)}
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

