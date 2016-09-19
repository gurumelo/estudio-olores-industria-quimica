var myApp = new Framework7({material:true,});  
var $$ = Dom7;

laurl = 'http://ejemplo.net:3000/';

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

function olor(fecha,grado,tipo,notas,nombre,posicion,foto) {
	var elolor = '<div class="card demo-card-header-pic">';
	if (foto) {
		elolor += '<a class="external" href="fotos/'+ foto +'" target="_blank"><div style="background-image:url(fotos/'+ foto +')" valign="bottom" class="card-header color-white no-border">p</div></a>';

	}
	elolor += '<div class="card-content"> ' +
				'<div class="card-content-inner"> ' +
				'<p class="color-gray">'+ formafecha(fecha) +'</p><br> ' +
				'<div class="content-block"> ' +
				'<div class="row"> ' +
				'<div class="col-100 centrado"> ' +
				'<div class="chip"> ' +
				'<div class="chip-media bg-blue">'+ grado +'</div> '+
				'<div class="chip-label color-black">'+ tipo +'</div> ' +
				'</div> ' +
				'</div> ' +
				'</div> ' +
				'</div><br> ' +
				'<p class="lasnotas">'+ notas +'</p> ' +
				'<div class="row"> ' +
				'<div class="col-80 autor color-gray"> ' +
				nombre +
				'</div> ' +
				'<div class="col-20" data-posicion="'+ posicion +'"> ' +
				'<span class="pdere"></span> ' +
				'</div> ' +
				'</div> ' +
				'<div id="map" style="min-height: 350px;"></div> ' +
				'</div> ' +
				'</div>';
	
		$$('.contenedor').append(elolor);

		var alalo = posicion.split(',');

		var map = L.map('map').setView(alalo, 13);

		L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',{
			maxZoom: 20,
			subdomains:['mt0','mt1','mt2','mt3']
		}).addTo(map);

	L.marker(alalo).addTo(map)
	


}


function unolor() {
	var elid = $$('#elid').data('id');
	$$.ajax({
		dataType: 'json',
		type: 'GET',
		cache: false,
		url: laurl +'olorid/'+ elid,
		success: function(response){
			if (response.error) {
				// CONTROLAR ERROR
				console.log(response);
			} else {
				console.log(response.message.grado);
				if (response.message.foto) {
					olor(response.message.createdAt,response.message.grado,response.message.tipo,response.message.notas,response.message.nombre,response.message.posicion,response.message.foto);
				} else {
					olor(response.message.createdAt,response.message.grado,response.message.tipo,response.message.notas,response.message.nombre,response.message.posicion,false);
				}
				
				setTimeout(function(){ myApp.hideNavbar('.navbar'); $$('.contenedor').css('margin-top','-50px'); }, 1500);

			}
		},
		error: function(){
			// CONTROLAR ERROR
			console.log('error');
		}
	});
}




unolor();

