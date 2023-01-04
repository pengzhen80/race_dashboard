const { Client } = require('pg')
// const config = require("./db.config")

// const pg_client = new Client(
//     {
//         database:config.dbname,
//         host: config.host,
//         port: config.port,
//         user: config.user,
//         password: config.password,
//     }
// );

const pg_local_client = new Client(
    {
        database:"cloudrace",
        host: "localhost",
        port: "5432",
        user: "pengzhen",
        password: "pengzhen",
    }
);

// await pg_client.connect()
 
// const res = await pg_client.query('SELECT $1::text as message', ['Hello world!'])
// console.log(res.rows[0].message) // Hello world!
// await pg_client.end()
module.exports = pg_local_client