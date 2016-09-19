var nuevos = 0;
var socket = io.connect('http://ejemplo.net:3000');
socket.on('olor', function (data) {
        //console.log(data);

	if (data.message.foto) {
                olor(data.message._id,data.message.createdAt,data.message.grado,data.message.tipo,data.message.notas,data.message.nombre,data.message.posicion,data.message.foto,true);
        } else {
               	olor(data.message._id,data.message.createdAt,data.message.grado,data.message.tipo,data.message.notas,data.message.nombre,data.message.posicion,false,true);
        }

	nuevos++;
	$$('title').text('Olores ('+ nuevos +')');


});

