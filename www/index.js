var confi		= require("./confi.json");
var fs			= require('fs');
var express		= require("express");
var bodyParser		= require("body-parser");
var valida		= require("validator");
var app			= express();

var server 		= require('http').Server(app);
var io 			= require('socket.io')(server);

var mongo		= require('./model/mongo');
var shortid		= require('shortid');

var multer		= require('multer');
var storage		= multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, 'public/fotos');
  },
  filename: function (req, file, callback) {
    callback(null, shortid.generate() +'-'+ Date.now() +'.jpg');
  }
});
var upload		= multer({
	storage : storage,
	limits: { fileSize: 72351744 },
	fileFilter: function (req, file, cb) {
		console.log(file);
		console.log(req.body); 
		console.log(Object.keys(req.body).length);
		if ( Object.keys(req.body).length == 6 && valida.isBase64(req.body.contrasena) && valida.escape(new Buffer(req.body.contrasena,'base64').toString('utf8')) == confi.contrasena && valida.isBase64(req.body.notas) && valida.isBase64(req.body.posicion) && valida.isBase64(req.body.grado) && valida.isBase64(req.body.tipo) && valida.isBase64(req.body.nombre) ) { 
			if (file.originalname !== 'blob' || file.mimetype !== 'image/jpeg') {
				return cb(null, false);
			} else {
				cb(null,true);
			}
		} else {
			return cb(null, false);
		}
	}
}).single('file');

// Envío de correos
var nodemailer = require('nodemailer');

var smtpOptions = {
	host: '127.0.0.1',
	port: 25,
	secure: false,
	ignoreTLS: true,
	tls: {
		rejectUnauthorized: false
	}
};

var transporter = nodemailer.createTransport(smtpOptions);

function correo(mensaje) {
	var outputHTML = mensaje;
	var mailOptions = {
		from: confi.emailre,
		to: confi.emaildes,
		subject: '[test]',
		html: outputHTML
	};

	transporter.sendMail(mailOptions, function(error, info) {
        	if(error) return error;
        	//console.log('Message sent: ' + info.response);
	});
}


var meses = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];

function formafecha(lafecha) {
	var fecha = new Date(lafecha);
	var horas = fecha.getHours();
	horas = ("0" + horas).slice(-2);
	var minutos = fecha.getMinutes();
	minutos = ("0" + minutos).slice(-2);
	var segundos = fecha.getSeconds();
	segundos = ("0" + segundos).slice(-2);
	fecha = fecha.getDate() +' '+ meses[fecha.getMonth()] +' '+ fecha.getFullYear() +'. '+ horas +':'+ minutos +':'+ segundos;
	return fecha;
}


app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});



// Templates/vistas ejs
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(express.static('./public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({"extended" : false}));


app.get("/", function(req, res){
	res.sendFile(__dirname +'/views/index.html');
});


app.post("/fotoolor", function (req, res) {
  	upload(req,res,function(err) {
		if (err || !req.file) {
			return res.json({"error": true});
			console.log('err');
		}
                var db = new mongo();
                var response = {};

                db.marca = "1";
                db.foto = req.file.filename;
		db.notas  = valida.escape(new Buffer(req.body.notas,'base64').toString('utf8'));
                db.posicion  = valida.escape(new Buffer(req.body.posicion,'base64').toString('utf8'));
                db.grado  = valida.escape(new Buffer(req.body.grado,'base64').toString('utf8'));
                db.tipo  = valida.escape(new Buffer(req.body.tipo,'base64').toString('utf8'));
                db.nombre  = valida.escape(new Buffer(req.body.nombre,'base64').toString('utf8'));

                db.save(function(err,data){
			if(err) {
                        	response = {"error": true};
                        } else {
                                response = {"error": false};
				io.emit('olor', {"error": false, "message": data});
				var contenidoemail = 'Olor: '+ confi.url + data._id +'<br /> Fecha: '+ formafecha(data.createdAt) +'<br /> Tipo: '+ data.tipo +'<br /> Grado: '+ data.grado +'<br /> Notas: '+ data.notas +'<br /> Nombre: '+ data.nombre +'<br /> Localización: https://maps.google.com/maps?q=loc:'+ data.posicion +'<br /> Foto: <br /><img src="'+ confi.url +'fotos/'+ data.foto  +'" /><br /><br />'+ confi.url; 
				correo(contenidoemail);
                        }
                        res.json(response);
                });

	});

});

app.post("/olor", function(req, res) {
	if ( Object.keys(req.body).length == 6 && valida.isBase64(req.body.notas) && valida.isBase64(req.body.posicion) && valida.isBase64(req.body.grado) && valida.isBase64(req.body.tipo) && valida.isBase64(req.body.nombre) && valida.isBase64(req.body.contrasena) ) {

		var contrasena = valida.escape(new Buffer(req.body.contrasena,'base64').toString('utf8'));
	
		if ( contrasena == confi.contrasena ) {
			
			var db = new mongo();
			var response = {};
			
			// los valores no pueden ser nulos. controlar en la aplicación
			//notas,posicion,grado,tipo,nombre,contrasena
			db.marca = "1";
			db.notas  = valida.escape(new Buffer(req.body.notas,'base64').toString('utf8'));
			db.posicion  = valida.escape(new Buffer(req.body.posicion,'base64').toString('utf8'));
			db.grado  = valida.escape(new Buffer(req.body.grado,'base64').toString('utf8'));
			db.tipo  = valida.escape(new Buffer(req.body.tipo,'base64').toString('utf8'));
			db.nombre  = valida.escape(new Buffer(req.body.nombre,'base64').toString('utf8'));
			
			db.save(function(err,data){
				if(err) {
					response = {"error": true};
				} else {
					response = {"error": false};	
					io.emit('olor', {"error": false, "message": data});
					var contenidoemail = 'Olor: '+ confi.url + data._id +'<br /> Fecha: '+ formafecha(data.createdAt) +'<br /> Tipo: '+ data.tipo +'<br /> Grado: '+ data.grado +'<br /> Notas: '+ data.notas +'<br /> Nombre: '+ data.nombre +'<br /> Localización: https://maps.google.com/maps?q=loc:'+ data.posicion +'<br /><br />'+ confi.url;
					correo(contenidoemail);
				}
				res.json(response);
			});	
				
		// si la contraseña es igual
		} else {
			res.json({"error": true});				
		}
		
	// si valida
	} else {
		res.json({"error": true});
	}
	
});

app.get("/olores", function(req, res) {
	var response = {};
	mongo.find({}, function(err, data) {
		if(err) {
			response = {"error": true, "message": "Error mongo"}
		} else {
			response = {"error" : false, "message": data};
		}
		res.json(response);
	});
});

app.get("/ultimosolores", function(req, res) {
	var response = {};
	mongo.find({}).sort({_id: -1}).limit(confi.porpagina).exec(function(err, data) {
		if(err) {
			response = {"error": true, "message": "Error mongo"}
                } else {
                        response = {"error" : false, "message": data};
                }
                res.json(response);
	});
});

app.get("/pagina/:siguiente", function(req,res) {
	if (valida.isInt(req.params.siguiente)) {
		mongo.find({}).sort({_id: -1}).skip(req.params.siguiente).limit(20).exec(function(err, data) {
			if(err) {
				response = {"error": true, "message": "Error mongo"}
                	} else {
                        	response = {"error" : false, "message": data};
                	}
                	res.json(response);
		});

	} else {
		res.sendStatus(404);
	}
});

app.get("/:objetoid", function(req,res) {
	if (valida.isMongoId(req.params.objetoid)) {
		res.render('o', { elid: req.params.objetoid });
	}
	else {
		res.sendStatus(404);
	}
});

app.get("/olorid/:elid", function(req,res) {
        if (valida.isMongoId(req.params.elid)) {

              mongo.findById(req.params.elid, function (err, data){
                        if(err) {
                                response = {"error": true, "message": "Error mongo"}
                        } else {
                                response = {"error" : false, "message": data};
                        }
                        res.json(response);

                });
        }
        else {
                res.sendStatus(404);
        }
});


app.post("/borrar", function(req,res) {
	if ( Object.keys(req.body).length == 2 && valida.isMongoId(req.body.elid) && valida.isBase64(req.body.lacontrasena) ) {
		var lacontrasenaborra = valida.escape(new Buffer(req.body.lacontrasena,'base64').toString('utf8'));
		if (lacontrasenaborra == confi.lacontrasenaborra) {
			mongo.findByIdAndRemove(req.body.elid, function(err, data) {
				if(err) {
                                	response = {"error": true, "message": "Error mongo"}
                        	} else {
                                	response = {"error" : false, "message": data._id};
					if (data.foto) {
						fs.unlink(__dirname +'/public/fotos/'+ data.foto, function(err){
							if (err) {
								console.log('error borrando foto');
							}
						});
					}
                        	}
                        	res.json(response);
			});
		} else {
			res.json({"error": true});
		}
	} else {
		res.json({"error": true});
	}
});


server.listen(3000);
console.log("La magia sucede en http://localhost:3000");
