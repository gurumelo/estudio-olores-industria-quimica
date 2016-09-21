var mongoose	= require("mongoose");
mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost:27017/olores');

var Schema = mongoose.Schema;

var oloresSchema = new Schema({
	nombre: String,
	tipo: String,
	grado: String,
	posicion: String,
	notas: String,
	foto: String,
	marca: String
},
{
    timestamps: true
});

process.on('SIGINT', function() {
	mongoose.connection.close(function () {
		console.log('Desconectado de mongo');
		process.exit(0);
	});
});


module.exports = mongoose.model('olores', oloresSchema);


