const { Client } = require('pg')

const pg_cloud_client = new Client(
    {
        database:"cloudrace",
        host: "skyracing.com.cn",
        port: "5432",
        user: "onlinemxcsk",
        password: "",
    }
);

module.exports = pg_cloud_client