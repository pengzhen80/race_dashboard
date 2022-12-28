const { Client } = require('pg')
const pg_client = new Client(
    {
        database:'localrace',
        host: '127.0.0.1',
        port: 5432,
        user: 'pengzhen',
        password: 'pengzhen',
    }
);
// await pg_client.connect()
 
// const res = await pg_client.query('SELECT $1::text as message', ['Hello world!'])
// console.log(res.rows[0].message) // Hello world!
// await pg_client.end()
module.exports = pg_client