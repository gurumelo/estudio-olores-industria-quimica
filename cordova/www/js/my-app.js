// Cuando el dispositivo está preparado intentamos obtener posición del gps y se lanza cámara
document.addEventListener("deviceready", vamos, false);

document.addEventListener("resume", permisos, false);


function vamos() {
	iniciarbase();
	permisos();
}

var estado = 0;
var mensajegps = 0;
var posicionboton = 0;
var imagenpre;
var mapaestatico;
var Base64 = {_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9+/=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/rn/g,"n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}};
var losdatos = {};
losdatos.contrasena = Base64.encode('*************');
var rutaimagen;
var lt = /</g, 
    gt = />/g, 
    ap = /'/g, 
    ic = /"/g;



function permisos(){
	
	//console.log('ejecuto PERMISOS!!!');
	
	window.plugins.insomnia.keepAwake();
	
    cordova.plugins.diagnostic.requestRuntimePermission(function(status){
        switch(status){
            case cordova.plugins.diagnostic.runtimePermissionStatus.GRANTED:
                //console.log("Permission granted (or already granted) - call the plugin");
                relocalizar();
                //console.log('Estoy dentro de GRANTED!!!!!');
                break;
            case cordova.plugins.diagnostic.runtimePermissionStatus.DENIED:
                //console.log("Permission denied - ask again");
                permisos();
                break;
            case cordova.plugins.diagnostic.runtimePermissionStatus.DENIED_ALWAYS:
                //console.log("Permission permanently denied");
				myApp.alert('Salimos. Denegó permiso de localización', 'Localización', function () {
					navigator.app.exitApp();
				});
                break;
        }
    }, function(error){
        console.error("ERROR: "+error);
    }, cordova.plugins.diagnostic.runtimePermission.ACCESS_FINE_LOCATION);
}


function relocalizar() {
	//console.log('Estoy dentro de RELOCALIZAR!!!');
	cordova.plugins.diagnostic.isLocationEnabled(function(enabled){
		//evita que haya varios procesos buscando la misma ubicación
		if (estado == 0) {
			if (enabled) {
				//console.log('habilitado');
				// Estado 1 por si hay un resume que no vuelva a.
				estado = 1;
				lalocalizacion();
			} else {
				//console.log('deshabilitado');
				if (mensajegps == 0) {
					// evitar duplicado de mensajes en android 6
					mensajegps = 1;
					myApp.alert('Actívelo para situarle', 'GPS', function () {
						mensajegps = 0;
						cordova.plugins.diagnostic.switchToLocationSettings();
					});
				}
			}
		}
	}, function(error){
		console.error("GPS error: "+error);
	});
}

function lalocalizacion() {
	//console.log('dentro de');
	var options = { maximumAge: 1, enableHighAccuracy: true };
	navigator.geolocation.getCurrentPosition(obtenida, noobtenida, options);
}

function obtenida(position) {

	lati = position.coords.latitude;
	longi = position.coords.longitude;
	//myApp.alert(lati +' '+ longi);
	
	losdatos.posicion = Base64.encode(lati +','+ longi);
		


	$$('#mapa').attr('src','https://maps.googleapis.com/maps/api/staticmap?format=jpeg&zoom=13&size=300x400&maptype=roadmap&markers=color:blue|'+ lati +','+ longi).on('load', function() {
		if (posicionboton == 3) {
			// el preloader está mostrándose y lo sustituimos por mapa
			var clonacionmapa = document.getElementById('mapa');
			var clonacionmapados = clonacionmapa.cloneNode(true);
			clonacionmapados.id = 'mapados';
			$$('#seis').html('').append(clonacionmapados);
			setTimeout(function(){ $$('.page-content').scrollTop($$('.messages').height(), 2000) }, 1000);
			
			// Se ha mostrado el mapa, pedir si quiere foto o no
			setTimeout( function() {
				mensaje('siete', 'message-received', '¿Quiere hacer una foto de la situación? <div class="list-block" id="listafoto"><ul><li class="foto"><label class="label-radio item-content"><input type="radio" name="radiofoto" value="Sí"><div class="item-media"><i class="icon icon-form-radio"></i></div><div class="item-inner"><div class="item-title">Sí</div></div></label></li><li class="foto"><label class="label-radio item-content"><input type="radio" name="radiofoto" value="No"><div class="item-media"><i class="icon icon-form-radio"></i></div><div class="item-inner"><div class="item-title">No</div></div></label></li></ul></div>', 'img/servidor.gif');
				$$('#areamensaje').prop('disabled', true);
				$$('#areamensaje').attr('placeholder','¿Foto?');
				setTimeout(function(){ $$('.page-content').scrollTop($$('.messages').height(), 2000) }, 1000);
				posicionboton++;
			}, 2500);
			
		} else {
			// el mapa ya está cargado y se mostrará cuando llegue el momento en case 2
			mapaestatico = true;
		}
		
	});

}

function noobtenida(error) {
	myApp.alert('No te situamos', 'Error GPS');
}

function iniciarbase() {
	var db = window.sqlitePlugin.openDatabase({name: 'olor.db', location: 'default'});
	db.transaction(function(tx) {
		tx.executeSql('CREATE TABLE IF NOT EXISTS nombre (id integer primary key, nombre text)');
		tx.executeSql('SELECT nombre FROM nombre;', [], function(tx, res) {
				if (res.rows.length > 0) {
					mensaje('uno','message-received', 'Hola '+ res.rows.item(0).nombre +' : ) ¿Cómo estás?', 'img/servidor.gif');
					//a qué huele
					mensaje('tres','message-received', 'Seleccione y envíe ¿A qué huele? <div class="list-block" id="listaolor"><ul><li class="aquehuele"><label class="label-radio item-content"><input type="radio" name="my-radio" value="floral-frutal"><div class="item-media"><i class="icon icon-form-radio"></i></div><div class="item-inner"><div class="item-title">Floral-Frutal</div></div></label></li><li class="aquehuele"><label class="label-radio item-content"><input type="radio" name="my-radio" value="medicinal"><div class="item-media"><i class="icon icon-form-radio"></i></div><div class="item-inner"><div class="item-title">Medicinal</div></div></label></li><li class="aquehuele"><label class="label-radio item-content"><input type="radio" name="my-radio" value="pesquería"><div class="item-media"><i class="icon icon-form-radio"></i></div><div class="item-inner"><div class="item-title">Pesquería</div></div></label></li><li class="aquehuele"><label class="label-radio item-content"><input type="radio" name="my-radio" value="gasolina"><div class="item-media"><i class="icon icon-form-radio"></i></div><div class="item-inner"><div class="item-title">Gasolina</div></div></label></li><li class="aquehuele"><label class="label-radio item-content"><input type="radio" name="my-radio" value="Petróleo"><div class="item-media"><i class="icon icon-form-radio"></i></div><div class="item-inner"><div class="item-title">Petróleo</div></div></label></li><li class="aquehuele"><label class="label-radio item-content"><input type="radio" name="my-radio" value="Pintura"><div class="item-media"><i class="icon icon-form-radio"></i></div><div class="item-inner"><div class="item-title">Pintura</div></div></label></li><li class="aquehuele"><label class="label-radio item-content"><input type="radio" name="my-radio" value="Azufre"><div class="item-media"><i class="icon icon-form-radio"></i></div><div class="item-inner"><div class="item-title">Azufre</div></div></label></li><li class="aquehuele"><label class="label-radio item-content"><input type="radio" name="my-radio" value="Vinagre"><div class="item-media"><i class="icon icon-form-radio"></i></div><div class="item-inner"><div class="item-title">Vinagre</div></div></label></li><li class="aquehuele"><label class="label-radio item-content"><input type="radio" name="my-radio" value="Cloro"><div class="item-media"><i class="icon icon-form-radio"></i></div><div class="item-inner"><div class="item-title">Cloro</div></div></label></li><li class="aquehuele"><label class="label-radio item-content"><input type="radio" name="my-radio" value="Mercaptano (gas)"><div class="item-media"><i class="icon icon-form-radio"></i></div><div class="item-inner"><div class="item-title">Mercaptano (gas)</div></div></label></li><li class="aquehuele"><label class="label-radio item-content"><input type="radio" name="my-radio" value="Amoniaco"><div class="item-media"><i class="icon icon-form-radio"></i></div><div class="item-inner"><div class="item-title">Amoniaco</div></div></label></li><li class="aquehuele"><label class="label-radio item-content"><input type="radio" name="my-radio" value="Huevos (SH₂)"><div class="item-media"><i class="icon icon-form-radio"></i></div><div class="item-inner"><div class="item-title">Huevos (SH₂)</div></div></label></li><li class="aquehuele"><label class="label-radio item-content"><input type="radio" name="my-radio" value="Plástico"><div class="item-media"><i class="icon icon-form-radio"></i></div><div class="item-inner"><div class="item-title">Plástico</div></div></label></li><li class="aquehuele"><label class="label-radio item-content"><input type="radio" name="my-radio" value="Otro"><div class="item-media"></div><div class="item-inner"><div class="item-title">Otro</div></div></label></li></ul></div>', 'img/servidor.gif');
					
					// se incrementa botón a caso 1 ya no se pide nombre
					posicionboton++;
					
					$$('#areamensaje').prop('disabled', true);
					$$('#areamensaje').attr('placeholder','¿A qué huele?');
					$$('#barmensaje').css('visibility','visible');
					//textarea pidiendo nombre
					
					//metemos en el json el nombre
					losdatos.nombre = Base64.encode(res.rows.item(0).nombre);
				} else {
					mensaje('uno','message-received', 'Hola : ) ¿Cómo te llamas?', 'img/servidor.gif');
					$$('#areamensaje').attr('placeholder','Su nombre');
					$$('#barmensaje').css('visibility','visible');
					//textarea pidiendo nombre
				}
			});
		}, function (err) {
			console.error('error: ' + err.message);
		}, function() {
			db.close(function() {
			//console.log('base cerrada');
		});
	});
	
}


function lahora() {
	var ahora = new Date();
	var hora = ahora.getHours() +':'+  (ahora.getMinutes()<10?'0':'') + ahora.getMinutes();
	return hora
}

function mensaje(id, dedonde, mensaje, imagen, si) {
	var quehora = lahora();
	var contenido = '<div class="message '+ dedonde +' message-with-avatar'+ (si === 'si' ? ' message-pic' : '') +'"> ' +
					'<div class="message-text"><div id="'+ id +'">' + mensaje + '</div> ' +
					'<div class="message-date">'+ quehora +'</div> ' +
					'</div> '+
					'<div style="background-image:url('+ imagen +')" class="message-avatar"></div> ' +
					'</div>';		
	$$('.messages').append(contenido);
}

function xss(valor) {
	valor = valor.toString().replace(lt, "&lt;").replace(gt, "&gt;").replace(ap, "&#39;").replace(ic, "&#34;");
	return valor;
}



var myApp = new Framework7({material:true,});  
var $$ = Dom7;



// Se pulsan botones de la barra de mensajes
$$('#botonmensaje').on('click', function() {
	switch(posicionboton) {
		case 0:
			// Primera vez que se ejecuta se pide nombre
			var sunombre = $$('#areamensaje').val();
			sunombre = xss(sunombre);
			if (!sunombre) {
				myApp.addNotification({
					message: 'Introduzca su nombre',
					button: {
						text: 'Vale'
					}
				});
			} else {
				// pasamos a base64 lo metemos en losdatos.nombre
				// metemos el nombre en la base de datos.
				// limpiamos val de areamensaje ocultamos barramensaje pasamos a la siguiente cosa.
				var db = window.sqlitePlugin.openDatabase({name: 'olor.db', location: 'default'});
				db.transaction(function(tx) {
					tx.executeSql('INSERT INTO nombre(nombre) VALUES (?)', [sunombre], function (resultSet) {
						mensaje('dos','message-sent', sunombre, 'img/humo.gif');
						losdatos.nombre = Base64.encode(sunombre);
						posicionboton++;
						$$('#areamensaje').val('');
						$$('#areamensaje').prop('disabled', true);
						$$('#areamensaje').attr('placeholder','¿A qué huele?');
						mensaje('tres','message-received', 'Seleccione y envíe ¿A qué huele? <div class="list-block" id="listaolor"><ul><li class="aquehuele"><label class="label-radio item-content"><input type="radio" name="my-radio" value="floral-frutal"><div class="item-media"><i class="icon icon-form-radio"></i></div><div class="item-inner"><div class="item-title">Floral-Frutal</div></div></label></li><li class="aquehuele"><label class="label-radio item-content"><input type="radio" name="my-radio" value="medicinal"><div class="item-media"><i class="icon icon-form-radio"></i></div><div class="item-inner"><div class="item-title">Medicinal</div></div></label></li><li class="aquehuele"><label class="label-radio item-content"><input type="radio" name="my-radio" value="pesquería"><div class="item-media"><i class="icon icon-form-radio"></i></div><div class="item-inner"><div class="item-title">Pesquería</div></div></label></li><li class="aquehuele"><label class="label-radio item-content"><input type="radio" name="my-radio" value="gasolina"><div class="item-media"><i class="icon icon-form-radio"></i></div><div class="item-inner"><div class="item-title">Gasolina</div></div></label></li><li class="aquehuele"><label class="label-radio item-content"><input type="radio" name="my-radio" value="Petróleo"><div class="item-media"><i class="icon icon-form-radio"></i></div><div class="item-inner"><div class="item-title">Petróleo</div></div></label></li><li class="aquehuele"><label class="label-radio item-content"><input type="radio" name="my-radio" value="Pintura"><div class="item-media"><i class="icon icon-form-radio"></i></div><div class="item-inner"><div class="item-title">Pintura</div></div></label></li><li class="aquehuele"><label class="label-radio item-content"><input type="radio" name="my-radio" value="Azufre"><div class="item-media"><i class="icon icon-form-radio"></i></div><div class="item-inner"><div class="item-title">Azufre</div></div></label></li><li class="aquehuele"><label class="label-radio item-content"><input type="radio" name="my-radio" value="Vinagre"><div class="item-media"><i class="icon icon-form-radio"></i></div><div class="item-inner"><div class="item-title">Vinagre</div></div></label></li><li class="aquehuele"><label class="label-radio item-content"><input type="radio" name="my-radio" value="Cloro"><div class="item-media"><i class="icon icon-form-radio"></i></div><div class="item-inner"><div class="item-title">Cloro</div></div></label></li><li class="aquehuele"><label class="label-radio item-content"><input type="radio" name="my-radio" value="Mercaptano (gas)"><div class="item-media"><i class="icon icon-form-radio"></i></div><div class="item-inner"><div class="item-title">Mercaptano (gas)</div></div></label></li><li class="aquehuele"><label class="label-radio item-content"><input type="radio" name="my-radio" value="Amoniaco"><div class="item-media"><i class="icon icon-form-radio"></i></div><div class="item-inner"><div class="item-title">Amoniaco</div></div></label></li><li class="aquehuele"><label class="label-radio item-content"><input type="radio" name="my-radio" value="Huevos (SH₂)"><div class="item-media"><i class="icon icon-form-radio"></i></div><div class="item-inner"><div class="item-title">Huevos (SH₂)</div></div></label></li><li class="aquehuele"><label class="label-radio item-content"><input type="radio" name="my-radio" value="Plástico"><div class="item-media"><i class="icon icon-form-radio"></i></div><div class="item-inner"><div class="item-title">Plástico</div></div></label></li><li class="aquehuele"><label class="label-radio item-content"><input type="radio" name="my-radio" value="Otro"><div class="item-media"></div><div class="item-inner"><div class="item-title">Otro</div></div></label></li></ul></div>', 'img/servidor.gif');
						// Mostramos mensaje de a qué huele!!!!!!!!!!!!!!!!!!!!
					});
					}, function(err) {
						console.error('SELECT error: ' + err.message);
					}, function() {
						db.close(function() {
							console.log('base desconectada');
						});
				
					});
				
				
			}
			break;
			
		case 1:
			// A qué huele?
			var olor = $$('#areamensaje').val();
			olor = xss(olor);
			if (!olor) {
				myApp.addNotification({
					message: 'Seleccione o escriba un olor',
					button: {
						text: 'Vale'
					}
				});
			} else {
				mensaje('cuatro','message-sent', olor, 'img/humo.gif');
				posicionboton++;
				// guardar el olor en losdatos json.
				
				losdatos.tipo = Base64.encode(olor);
				
				$$('#listaolor').addClass('disabled');
				$$('.page-content').scrollTop($$('.messages').height(), 1500, function() {
					mensaje('cinco','message-received', 'Seleccione y envíe ¿En qué grado huele? <div class="list-block" id="listagradoolor"><ul><li class="gradoolor"><label class="label-radio item-content"><input type="radio" name="radioolor" value="1"><div class="item-media"><i class="icon icon-form-radio"></i></div><div class="item-inner"><div class="item-title">1</div></div></label></li><li class="gradoolor"><label class="label-radio item-content"><input type="radio" name="radioolor" value="2"><div class="item-media"><i class="icon icon-form-radio"></i></div><div class="item-inner"><div class="item-title">2</div></div></label></li><li class="gradoolor"><label class="label-radio item-content"><input type="radio" name="radioolor" value="3"><div class="item-media"><i class="icon icon-form-radio"></i></div><div class="item-inner"><div class="item-title">3</div></div></label></li><li class="gradoolor"><label class="label-radio item-content"><input type="radio" name="radioolor" value="4"><div class="item-media"><i class="icon icon-form-radio"></i></div><div class="item-inner"><div class="item-title">4</div></div></label></li><li class="gradoolor"><label class="label-radio item-content"><input type="radio" name="radioolor" value="5"><div class="item-media"><i class="icon icon-form-radio"></i></div><div class="item-inner"><div class="item-title">5</div></div></label></li><li class="gradoolor"><label class="label-radio item-content"><input type="radio" name="radioolor" value="6"><div class="item-media"><i class="icon icon-form-radio"></i></div><div class="item-inner"><div class="item-title">6</div></div></label></li><li class="gradoolor"><label class="label-radio item-content"><input type="radio" name="radioolor" value="7"><div class="item-media"><i class="icon icon-form-radio"></i></div><div class="item-inner"><div class="item-title">7</div></div></label></li><li class="gradoolor"><label class="label-radio item-content"><input type="radio" name="radioolor" value="8"><div class="item-media"><i class="icon icon-form-radio"></i></div><div class="item-inner"><div class="item-title">8</div></div></label></li><li class="gradoolor"><label class="label-radio item-content"><input type="radio" name="radioolor" value="9"><div class="item-media"><i class="icon icon-form-radio"></i></div><div class="item-inner"><div class="item-title">9</div></div></label></li><li class="gradoolor"><label class="label-radio item-content"><input type="radio" name="radioolor" value="10"><div class="item-media"><i class="icon icon-form-radio"></i></div><div class="item-inner"><div class="item-title">10</div></div></label></li></ul></div>','img/servidor.gif');
					setTimeout(function(){ $$('.page-content').scrollTop($$('.messages').height(), 2000) }, 1000);
				})

				$$('#areamensaje').val('');
				$$('#areamensaje').prop('disabled', true);
				$$('#areamensaje').attr('placeholder','¿En qué grado huele?');

			}
			break;
			
		//grado de olor
		case 2:
		
			var gradoolor = $$('#areamensaje').val();
			gradoolor = xss(gradoolor);
			if (!gradoolor) {
				myApp.addNotification({
					message: 'Seleccione un grado de olor',
					button: {
						text: 'Vale'
					}
				});
			} else {
				posicionboton++;
				mensaje('cinco','message-sent', gradoolor, 'img/humo.gif');
				
				// guardar el gradoolor en losdatos json.
				
				losdatos.grado = Base64.encode(gradoolor);
				
				$$('#listagradoolor').addClass('disabled');

				setTimeout(function(){ $$('.page-content').scrollTop($$('.messages').height(), 2000) }, 1000);

					
					// hacer comprobacion de losdatos.posicion si
					// si se dibuja mapa con marca en caso contrario, loading.
					// losdatos.nombre .tipo .grado .posicion .notas
					
					if (!mapaestatico) {
						mensaje('seis','message-sent', '<div class="md-preloader"><svg xmlns="http://www.w3.org/2000/svg" version="1.1" height="32" width="32" viewbox="0 0 75 75"><circle cx="37.5" cy="37.5" r="33.5" stroke-width="6"/></svg></div>', 'img/humo.gif', 'si');						
					} else {
						var clonacionmapa = document.getElementById('mapa');
						var clonacionmapados = clonacionmapa.cloneNode(true);
						clonacionmapados.id = 'mapados';
						mensaje('seis','message-sent', '', 'img/humo.gif', 'si');
						$$('#seis').append(clonacionmapados);
						
						// Se ha mostrado mapa, foto?
						setTimeout( function() {
							mensaje('siete', 'message-received', '¿Quiere hacer una foto de la situación? <div class="list-block" id="listafoto"><ul><li class="foto"><label class="label-radio item-content"><input type="radio" name="radiofoto" value="Sí"><div class="item-media"><i class="icon icon-form-radio"></i></div><div class="item-inner"><div class="item-title">Sí</div></div></label></li><li class="foto"><label class="label-radio item-content"><input type="radio" name="radiofoto" value="No"><div class="item-media"><i class="icon icon-form-radio"></i></div><div class="item-inner"><div class="item-title">No</div></div></label></li></ul></div>', 'img/servidor.gif');
							$$('#areamensaje').prop('disabled', true);
							$$('#areamensaje').attr('placeholder','¿Foto?');
							setTimeout(function(){ $$('.page-content').scrollTop($$('.messages').height(), 2000) }, 1000);
							posicionboton++;
						}, 3500);						
						
					}
					
					
					
				setTimeout(function(){ $$('.page-content').scrollTop($$('.messages').height(), 2000) }, 1000);

				$$('#areamensaje').val('');
				$$('#areamensaje').prop('disabled', true);
				$$('#areamensaje').attr('placeholder','Localizándole...');
				


			}
		
			break;
		case 4:
			myApp.addNotification({
				message: 'Seleccione sí o no',
				button: {
					text: 'Vale'
				}
			});	
			break;
			
		case 5:
			var notas = $$('#areamensaje').val();
			notas = xss(notas);
			if (!notas) {
				myApp.addNotification({
					message: 'Escriba alguna nota',
					button: {
						text: 'Vale'
					}
				});
			} else {
				mensaje('ocho','message-sent', notas, 'img/humo.gif');
				
				losdatos.notas = Base64.encode(notas);
								
				$$('#areamensaje').val('');
				$$('#areamensaje').prop('disabled', true);
				$$('#areamensaje').attr('placeholder','Guardando...');
				
				mensaje('nueve','message-received', '<div class="md-preloader"><svg xmlns="http://www.w3.org/2000/svg" version="1.1" height="32" width="32" viewbox="0 0 75 75"><circle cx="37.5" cy="37.5" r="33.5" stroke-width="6"/></svg></div>', 'img/servidor.gif');
				
				setTimeout(function(){ $$('.page-content').scrollTop($$('.messages').height(), 2000) }, 1000);

				// si rutaimagen, ft, en caso contrario el ajax de datos sin imagen.
				
				if (rutaimagen) {
				
					//console.log("LA RUTAAAAAA: "+ rutaimagen);
				
					/*
					function subida(r) {
							console.log(r);
							console.log('VAMOSSSSSSSSSSSSSSSSSSSS!!!');
					}
					
					function fallosubida(error) {
							console.log(error);
					}
					
					//console.log(rutaimagen);
					var opciones = new FileUploadOptions();
					opciones.fileKey = 'file';
					opciones.fileName = 'imagen.jpg';
					opciones.mimeType = 'image/jpeg';
					opciones.chunkedMode = false;
					
					opciones.params = losdatos;
					
					var ft = new FileTransfer();
					ft.upload(laimagenfin.nativeURL, encodeURI('http://ejemplo.net:3000/fotoolor'), subida, fallosubida, opciones);
					
					console.log('NO VAMOSSSSSSSSS!!!');
				*/
				
				
					var fd = new FormData();
					window.resolveLocalFileSystemURL(rutaimagen, function(fileEntry) {
						fileEntry.file(function(file) {
							var reader = new FileReader();
							reader.onloadend = function(e) {
								
								fd.append('nombre', losdatos.nombre);
								fd.append('tipo', losdatos.tipo);
								fd.append('grado', losdatos.grado);
								fd.append('posicion', losdatos.posicion);
								fd.append('notas', losdatos.notas);
								fd.append('contrasena', losdatos.contrasena);
								
								var imgBlob = new Blob([ this.result ], { type: "image/jpeg" } );
								fd.append('file', imgBlob);
								
								var request = new XMLHttpRequest();
								request.open("POST", "http://ejemplo.net:3000/fotoolor", true);


								request.onreadystatechange = function() {
									console.log(posicionboton);
									//arreglar reiniciar posicionboton
									var status;
									var data;

									if (request.readyState == 4) {
										status = request.status;
										if (status == 200) {
											data = JSON.parse(request.responseText);
											if (!data.error) {
												$$('#nueve').html('Gracias '+ Base64.decode(losdatos.nombre) +' <a href="#" class="reinicio link">¿Comenzamos de nuevo?</a>');
												$$('#areamensaje').attr('placeholder','Guardado');
												setTimeout(function(){ $$('.page-content').scrollTop($$('.messages').height(), 2000) }, 1000);
												posicionboton++;

											} else {
												$$('#nueve').html('No se ha podido guardar <a href="#" class="reinicio link">Comencemos de nuevo</a>');
												$$('#areamensaje').attr('placeholder','Error');
												setTimeout(function(){ $$('.page-content').scrollTop($$('.messages').height(), 2000) }, 1000);
												posicionboton++;

											}
										} else {
											$$('#nueve').html('No se ha podido guardar <a href="#" class="reinicio link">Comencemos de nuevo</a>');
											$$('#areamensaje').attr('placeholder','Error');
											console.log('error');
											setTimeout(function(){ $$('.page-content').scrollTop($$('.messages').height(), 2000) }, 1000);
											posicionboton++;
										}
									}
								};
								
								
								request.send(fd);
							};
							reader.readAsArrayBuffer(file);

						}, function(e){console.log(e)});
					}, function(e){console.log(e)});


					
				} else {
					
					$$.ajax({
						dataType: 'json',
						type: 'POST',
						cache: false,
						url: 'http://ejemplo.net:3000/olor',
						data: losdatos,
						success: function(response){
							posicionboton++;
							if (response.error) {
								$$('#nueve').html('No se ha podido guardar <a href="#" class="reinicio link">Comencemos de nuevo</a>');
								$$('#areamensaje').attr('placeholder','Error');
							} else {
								$$('#nueve').html('Gracias '+ Base64.decode(losdatos.nombre) +' <a href="#" class="reinicio link">¿Comenzamos de nuevo?</a>');
								$$('#areamensaje').attr('placeholder','Guardado');
							}
						},
						error: function(){
							posicionboton++;
							$$('#nueve').html('No se ha podido guardar <a href="#" class="reinicio link">Comencemos de nuevo</a>');
							$$('#areamensaje').attr('placeholder','Error');
						}
					});
					
				//fin else foto
				}
			
			}
			
			break;
			
		case 6:
			location.reload(); 
			break;
		
	// fin switch	
	}

});

//cada vez que se pulsa en la lista de olores
$$(document).on('click', '.aquehuele', function () {
	//si valorhuele es igual a otro, quitar disabled a areamensaje y focus y placeholder.
	if (posicionboton == 1) {
		var valorhuele = $$(this).text();
		if (valorhuele == 'Otro') {
			$$('#areamensaje').prop('disabled', false);
			$$('#areamensaje').attr('placeholder','Especifique otro');
			$$('#areamensaje').val('');
			$$('#areamensaje').focus();	
		} else { 
			$$('#areamensaje').prop('disabled', true);
			$$('#areamensaje').attr('placeholder','¿A qué huele?');
			$$('#areamensaje').val(valorhuele);
		}
	}
});

//cada vez que se pulsa en la lista de grados
$$(document).on('click', '.gradoolor', function () {
	if (posicionboton == 2) {
		var valorgrado = $$(this).text();
		$$('#areamensaje').val(valorgrado);
	}
});


//si o no foto
$$(document).on('click', '.foto', function() {
	if (posicionboton == 4) {
		posicionboton++;
		var respuestafoto = $$(this).text();
		$$('#listafoto').addClass('disabled');
		mensaje('respuestafoto','message-sent', respuestafoto, 'img/humo.gif');
		setTimeout(function(){ $$('.page-content').scrollTop($$('.messages').height(), 2000) }, 500);
		if (respuestafoto == "No") {
			mensaje('unoocho','message-received', 'Ya queda poco, escriba sus notas de campo', 'img/servidor.gif');
			$$('#areamensaje').prop('disabled', false);
			$$('#areamensaje').attr('placeholder','Sus notas de campo');
			setTimeout(function(){ $$('.page-content').scrollTop($$('.messages').height(), 2000) }, 1000);
			
		} else {
			setTimeout(
				function(){
					navigator.camera.getPicture(onSuccess, onFail, { quality: 90, destinationType: Camera.DestinationType.FILE_URI, targetWidth: 800, targetHeight: 600, correctOrientation: true });
				},
				2500
			);
			// allowEdit: true

			function onSuccess(imageURI) {
				
				//volcar foto en un mensaje enviado
				mensaje('veinte', 'message-sent', '<img src="'+ imageURI +'">', 'img/humo.gif', 'si');
				setTimeout(function(){ $$('.page-content').scrollTop($$('.messages').height(), 1000) }, 800);
				//mostrar el mensaje de notas de campo
				mensaje('unoocho','message-received', 'Ya queda poco, escriba sus notas de campo', 'img/servidor.gif');
				$$('#areamensaje').prop('disabled', false);
				$$('#areamensaje').attr('placeholder','Sus notas de campo');
				setTimeout(function(){ $$('.page-content').scrollTop($$('.messages').height(), 2000) }, 1000);
				
				//console.log(imageURI);
				
				rutaimagen = imageURI;

				
			}

			function onFail(message) {
				
				setTimeout(
					function(){
						navigator.camera.getPicture(onSuccess, onFail, { quality: 90, destinationType: Camera.DestinationType.FILE_URI, targetWidth: 800, targetHeight: 600, correctOrientation: true });
					},
					2000
				);

			}
		}
	}
});

$$('#salida').on('click', function() {
	navigator.app.exitApp();
});

$$(document).on('click', '.reinicio', function () {
	location.reload(); 
});

$$(document).on('click', '.salir', function () {
	navigator.app.exitApp();
});
