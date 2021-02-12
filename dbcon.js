var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'https://localhost/phpmyadmin/',
  user            : 'admin',
  password        : 'passowrd',
  database        : 'test_cs340'
});

module.exports.pool = pool;
				