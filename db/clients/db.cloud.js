const { Client } = require('pg')

//I hide cloud params for safe, use the local params
const pg_cloud_client = new Client(
    {
        database:"cloudrace",
        host: "localhost",
        port: "5432",
        user: "pengzhen",
        password: "pengzhen",
    }
);

module.exports = pg_cloud_client