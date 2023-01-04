# race_dashboard
server frame : node.js,express;
db: sqlite3,postgresql;

target : analyze pigeon track(gpx data) into features like speed,distance and so on;

gpx data source: three ways : sqlite3,local postgresql db, cloud postgresql db;
sqlite3 : read one race's gpx files and stored into sqlite3.
local postgresql db : copy test cloud server's data into local postgressql db.
cloud postgresql db : As the data of real db is too large cannot restored by backup-db, this way is  getting data from cloud db directly. 

apis: raceinfo,race_rankinfo,race_record_summaryFeatures,race_record_rawdata.

code interduction:
./core : functions to calculate science features of tracks
./db : 
./db/clients : three db clients
./db/models_sqlites : models of sqlites : each tables' crud;
./db/models_postgres.cloud : models of cloud postgres : each tables' crud;
./db/models_postgres.local : models of local postgres : each tables' crud;

./public
./public/gpxfiles : origin gpxfiles, store them into sqlites
./public/ranks  : origin race_rank file, store them into sqlites

./routes
./routes/api.js  : all apis route in here
./routes/apis all : api details in here
./routes/abandons : abandoned api in here

postman's link:
https://documenter.getpostman.com/view/24878317/2s8Z6u4Ev4#6e30f599-9b4a-46f9-9133-120853a84450