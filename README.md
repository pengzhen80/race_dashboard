# race_dashboard
server frame : node.js,express;
db: sqlite3,postgresql;
code style: google code style , eslint checked

target : analyze pigeon track(gpx data) into features like speed,distance and so on;

gpx data source: three ways : sqlite3,local postgresql db, cloud postgresql db;
sqlite3 : read one race's gpx files and stored into sqlite3.
local postgresql db : copy test cloud server's data into local postgressql db.
cloud postgresql db : As the data of real db is too large to be restored by backup-db, this way is  getting data from cloud db directly. 

apis: raceinfo,race_rankinfo,race_record_summaryFeatures,race_record_rawdata.

code interduction:
./core : functions to calculate science features of tracks
./db : 
./db/dbsoure_public : restore postsql db with this backup.
./db/clients : three db clients , I hide the cloud client for safe.
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

how to use:
prepare postgresql db:
step1 : install postgresql
step3 : create db 'cloudrace'
step4 : restore cloudrace with the sqlfile in ./db/dbsource_public/cloudrace.sql
sqlite3 prepared by run server, db structure in 'race_dashboard-db design.drawio.png'
run server
step5 : npm i & start
use postman to call api locally
step6 : install postman
step7 : call api as the postman's link 
postman's link:
https://documenter.getpostman.com/view/24878317/2s8Z6u4Ev4#6e30f599-9b4a-46f9-9133-120853a84450