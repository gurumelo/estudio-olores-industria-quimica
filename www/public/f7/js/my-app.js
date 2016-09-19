var myApp = new Framework7({material:true,});  
var $$ = Dom7;

var laurl = 'http://ejemplo.net:3000/'

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

function olor(elid,fecha,grado,tipo,notas,nombre,posicion,foto,socket) {
	var elolor = '<div id="'+ elid +'" class="card demo-card-header-pic">';
	if (foto) {
		elolor += '<a class="external" href="fotos/'+ foto +'" target="_blank"><div style="background-image:url(fotos/'+ foto +')" valign="bottom" class="card-header color-white no-border">p</div></a>';

	}
	elolor += '<div class="card-content"> ' +
				'<div class="card-content-inner"> ' +
				'<div class="row"><div class="col-80"><a class="external" href="'+ elid +'" target="_blank"><p class="color-gray">'+ formafecha(fecha) +'</p></a></div><div class="col-20 borrar color-bluegray" data-id="'+ elid +'"><span class="pdere">X </span></div></div><br> ' +
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
				'<div class="col-20 localizacion color-bluegray" data-posicion="'+ posicion +'"> ' +
				'<span class="pdere">1 </span>' +
				'</div> ' +
				'</div> ' +
				'</div> ' +
				'</div>';
	if (socket) {
		$$('.contenedor').prepend(elolor);
	} else {
		$$('.contenedor').append(elolor);
	}

}

function ultimosolores() {
	$$.ajax({
		dataType: 'json',
		type: 'GET',
		cache: false,
		url: laurl +'ultimosolores',
		success: function(response){
			if (response.error) {
				myApp.alert('', 'Error');
			} else {
				$$.each(response.message, function (llave, valor) {
					if (valor.foto) {
						olor(valor._id,valor.createdAt,valor.grado,valor.tipo,valor.notas,valor.nombre,valor.posicion,valor.foto,false);
					} else {
						olor(valor._id,valor.createdAt,valor.grado,valor.tipo,valor.notas,valor.nombre,valor.posicion,false,false);
					}
					//console.log(llave + ': ' + valor.nombre + ': '+ valor.tipo +': '+ formafecha(valor.createdAt));
				});
				$$('.infinite-scroll-preloader').hide();
				setTimeout(function(){ myApp.hideNavbar('.navbar'); $$('.contenedor').css('margin-top','-50px'); }, 1500);

			}
		},
		error: function(){
			myApp.alert('', 'Error');
		}
	});
}


ultimosolores();

var mapanum = 0;

$$(document).on('click', '.localizacion', function() {
	
	$$(this).hide();

	var lalo = $$(this).data('posicion');

	var alalo = lalo.split(',');

	var donde = $$(this).parents('div.card-content-inner');

	$$(donde).append('<div id="mapa'+ mapanum +'" class="elmapa"></div>');
	
	var map = L.map('mapa'+ mapanum,{scrollWheelZoom:false}).setView(alalo, 13);

	//L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
	//	attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
	//}).addTo(map);

	L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',{
		maxZoom: 20,
		subdomains:['mt0','mt1','mt2','mt3']
	}).addTo(map);

	L.marker(alalo).addTo(map)

	var adonde = $$('.page-content').scrollTop();

	$$('.page-content').scrollTop(adonde+35,1000);

	mapanum++;
});


var loading = false;

$$('.infinite-scroll').on('infinite', function () {
 
	// salir si está cargando
	if (loading) return;

	loading = true;


	var cuantos = $$('.card').length;

	$$('.infinite-scroll-preloader').show();

	$$.ajax({
		dataType: 'json',
		type: 'GET',
		cache: false,
		url: laurl +'pagina/'+ cuantos,
		success: function(response){
			if (response.error) {
				myApp.alert('', 'Error');
			} else {
				if (response.message.length > 0) {
					$$.each(response.message, function (llave, valor) {
						if (valor.foto) {
							olor(valor._id,valor.createdAt,valor.grado,valor.tipo,valor.notas,valor.nombre,valor.posicion,valor.foto,false);
						} else {
							olor(valor._id,valor.createdAt,valor.grado,valor.tipo,valor.notas,valor.nombre,valor.posicion,false,false);
						}
					});
					loading = false;	
					$$('.infinite-scroll-preloader').hide();
				} else {
					myApp.detachInfiniteScroll($$('.infinite-scroll'));
					// Remover preloader
					$$('.infinite-scroll-preloader').remove();
					$$('.contenedor').append('<div class="nomas color-gray">y</div>');
					return;
				}
			}
		},
		error: function(){
			myApp.alert('', 'Error');
		}
	});




});          

var Base64 = {_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9+/=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/rn/g,"n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}};

function borrarolor(elid,lacontrasena) {
	$$.ajax({
		dataType: 'json',
		type: 'POST',
		cache: false,
		data: {"elid": elid, "lacontrasena": lacontrasena},
		url: laurl +'borrar',
		success: function(response){
			if (response.error) {
				myApp.alert('', 'Error');
			} else {
				//eliminar el olor por el id devuelto.
				$$('#'+ response.message).remove();
			}
		},
		error: function(){
			myApp.alert('', 'Error');
		}
	});

}

$$(document).on('click', '.borrar', function() {
	var idborrar = $$(this).data('id');
	myApp.modalPassword('', '¿Borrar olor?', function (password) {
		var lapassword = Base64.encode(password);
		borrarolor(idborrar, lapassword);
	});
});
