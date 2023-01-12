const {Pool} = require('pg');

const pgLocalClient = new Pool(
    {
      database: 'localrace',
      host: 'localhost',
      port: '5432',
      user: 'pengzhen',
      password: 'pengzhen',
    },
);

module.exports = pgLocalClient;
