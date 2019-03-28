module.exports = function (app, swig, gestorBD) {

	app.get('/desconectarse', function (req, res) {
		req.session.usuario = null;
		res.send("Usuario desconectado");
	   })
	app.post("/identificarse", function (req, res) {
		var seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
			.update(req.body.password).digest('hex');
		var criterio = {
			email: req.body.email,
			password: seguro
		}
		gestorBD.obtenerUsuarios(criterio, function (usuarios) {
			if (usuarios == null || usuarios.length == 0) {
				req.session.usuario = null;
				res.send("No identificado: ");
			} else {
				req.session.usuario = usuarios[0].email;
				res.redirect("/publicaciones");

			}
		});
	});

	app.get("/identificarse", function (req, res) {
		var respuesta = swig.renderFile('views/bidentificacion.html', {});
		res.send(respuesta);
	});
	app.get('/usuarios', function (req, res) {
		res.send('ver usuarios');
	});
	app.get("/registrarse", function (req, res) {
		var respuesta = swig.renderFile('views/bregistro.html', {});
		res.send(respuesta);
	});
	app.post('/usuario', function (req, res) {
		var seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
			.update(req.body.password).digest('hex');
		var usuario = {
			email: req.body.email,
			password: seguro
		}

		var usuarioCheck={
			email:usuario.email
		}
		gestorBD.obtenerUsuarios(usuarioCheck, function (usuarios) {
			if (usuarios == null || usuarios.length == 0) {
				//No user with that email
				gestorBD.insertarUsuario(usuario, function (id) {
					if (id == null) {
						res.send("Error al insertar ");
		
					} else {
						res.redirect("/identificarse");

					}
				});
			} else {
				res.send("Email no valido");
			}
		});

		

	})


};
