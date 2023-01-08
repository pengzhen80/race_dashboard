const { Pool } = require('pg')

const pg_local_client = new Pool(
    {
        database:"cloudrace",
        host: "localhost",
        port: "5432",
        user: "postgres",
        password: "",
    }
);

module.exports = pg_local_client