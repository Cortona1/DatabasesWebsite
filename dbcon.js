var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : 'cs340_hillaid',
  password        : '9500',
  database        : 'cs340_hillaid'
});

module.exports.pool = pool;
				