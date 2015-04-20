var mysql      = require('mysql');
var fs = require('fs');
var pool  = mysql.createPool({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'issn'
});

exports.query = function (sql, callback) {

	pool.getConnection(function(err, connection) {		
		connection.query(sql, function(err, rows, fields) {
			if (!err){
				callback(rows);
				connection.release();

			} else {
				errorlog(sql + "\n");
				connection.release();
			}					
		});	
	});	
}

function errorlog(msg){
	fs.appendFile("error.log", msg, function(err) {
		if ( err ) {		
			console.log("Error appending file. Msg: " + err, "on: ", filename, msg);
		}
	});
}