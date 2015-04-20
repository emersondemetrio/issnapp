var db = require('./database');
var path = require('path');
var express = require('express');
var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', function (req, res) {
	init();
	res.send("ok");
});

var currentDatabase = "issnwork4";

init();
function getTraduzido(original, callback){
	var sql = "SELECT issn, estrato FROM original WHERE issn = '" + original + "' LIMIT 1";
	
	var traduzido = {
		estrato: "nao_traduzido"
	}

	db.query(sql, function(rows){
		var resp = rows;

		if(rows.length > 0){			
			traduzido.estrato = rows[0].estrato;
			callback(traduzido);
		}

		callback(traduzido);
	});
}

function marcarNaoTraduziveis(){
	var sql = "update " + currentDatabase + " SET issnTraduzido = 'nao_traduzido' WHERE issnOriginal = '0';";
	
	db.query(sql, function(){
		console.log("setado.", sql);
	});
}

function init(){
	marcarNaoTraduziveis();
	
	var sql = "SELECT id, issnOriginal FROM " + currentDatabase + " WHERE issnOriginal <> '0' ";
	sql += "AND (issnTraduzido IS NULL OR issnTraduzido = 0 OR issnTraduzido <> 'nao_traduzido')";
	
	db.query(sql, function(rows){
		var naoTraduzidos = rows;		

		naoTraduzidos.forEach(function(atual){		
			console.log("atual: ", atual);
			
			getTraduzido(atual.issnOriginal, function(dados){
				var traduzido = dados.estrato;				

				updateProfessor(atual.id, traduzido);			
			});
		});
	});
}

function updateProfessor(id, newStatus){

	var sql = "UPDATE "+ currentDatabase +" SET issnTraduzido = '" + newStatus + "' where id = " + id;

	db.query(sql, function(){
		console.log("update", sql);
	});
}

app.get('/traduzir/:codigo', function(req, res){
	var sql = "select * from original WHERE issn =" + req.params.codigo + " LIMIT 1";
	db.query(sql, function(rows){
		res.render("issn", {data:rows[0]});
	});
});


//express e node stuff

app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});

var debug = require('debug')('my-application');
app.set('port', process.env.PORT || 3000);
var server = app.listen(app.get('port'), function() {
	debug('Express server listening on port ' + server.address().port);
});