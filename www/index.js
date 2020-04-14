
$.support.cors = true;
var _url="http://frt.hopto.org:82";		
		function Conectar(){	
			window.location.reload();
		}
		
		function downloadFile(url,filename,extension,email,pass,ca){
			$.post(url+'/logic/controlador.aspx?op=IniciarSesion&seccion=seguridad&fraccionamiento=' + ca, [{ name: "email", value: email }, { name: "contrasena", value: pass }]
			, function (xmlDoc) {
				var fileTransfer = new FileTransfer();
				var localpath = cordova.file.externalDataDirectory + filename;
				fileTransfer.download(encodeURI(url),
					localpath,
					function (thefile) {
						var localpath = thefile.toURL();
						try {
							cordova.plugins.fileOpener2.open(
								localpath,
								(extension == "xlsx" ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : (extension == "img" ? "image/png" : "application/pdf")),
								{
									error: function(){},
									success: function(){
									
									}
								}
							);
						} catch(e){
							alert(e.message);
						}
					},
					function(error){
						alert("Falló descarga de archivo.");
					}
				);
			});			
		}
		
		var iniciar=function(){
			try {document.addEventListener("deviceready", ondeviceready, false);} catch (e) {}
			alert(1);
			if(!window.navigator.onLine){
				window.frames["app"].location.href="no-internet.html";
			}else{
				window.frames["app"].location.href=_url+"/ui/mobile/safra/index.aspx";
			}
			alert(2);
		}
		
		var ondeviceready = function () {
			window.frames["app"].postMessage({funcion:"IsPhoneGap",params:[true]},'*');
			FCMPlugin.onNotification(function(data){
				cordova.plugins.notification.badge.increase(1, function () { }); 
				/*if(data.wasTapped){
					cordova.plugins.notification.badge.set(0);
				}*/
				if (data.modulo == 1){
					window.frames["app"].postMessage({funcion:"ActivarAlarma_",params:[data.contenidovoz]},'*');
				}else{
					window.frames["app"].postMessage({funcion:"PantallaMostrar",params:["notificaciones", "section"]},'*');
				} 
			});
		}
		
		var i_unsubs = 0;
		function DesSuscribirNotificaciones(datos){
			if (i_unsubs < datos.length){
				FCMPlugin.unsubscribeFromTopic(datos[i_unsubs], function () {
					if (i_unsubs < l_s) {DesSuscribirNotificaciones(datos);}
				});
			}
		}

		var i_subs = 0;
		function SuscribirNotificaciones(datos) {
			if (i_subs < datos.length){
				FCMPlugin.subscribeToTopic(datos[i_subs++], function(){
					SuscribirNotificaciones(datos); 
				});
			}
		}	
		
		function SeleccionarImagenes(){
			try {				
				window.imagePicker.getPictures(
					function (results) {
						if(results.length > 0) {							
							try{
								window.frames["app"].postMessage({funcion:'CargarImagenPhoneGap',params:[results[results.length-1]]},'*');
							}catch(e){alert(e.message);}
						};	
					}, function (error) {
						alert('Error: ' + error);
					},{maximumImagesCount: 2,width: 500,height: 500,quality: 40, outputType: 1}
				);
				
			} catch (e) { alert(e.message);}
		}
				
		window.addEventListener("message", function(event) {
			try{
				window[event.data.funcion](...event.data.datos);
			}catch(e){alert(e.message);}
		}, false);