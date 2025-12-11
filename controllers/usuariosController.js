import { check, validationResult } from "express-validator";
import bcrypt from "bcrypt";
import { generarId, generarJWT } from "../helpers/tokens.js";
import Usuario from "../models/Usuarios.js";
import { emailRegistro, emailOlvidePassword } from "../helpers/emails.js";

const formularioLogin = (req, res) => {
  res.render("auth/login", {
    tituloPagina: "Inicio de Sesión",
    csrfToken: req.csrfToken(),
    usuario: req.usuario
  });
};

const autenticar = async (req, res) => {
  // Validación
  await check("email")
    .isEmail()
    .withMessage("El correo es obligatorio")
    .run(req);

  await check("password")
    .notEmpty()
    .withMessage("La contraseña no puede estar vacia")
    .run(req);

  let resultado = validationResult(req);

  // Verificar que el resultado este vacio
  if (!resultado.isEmpty()) {
    // Errores
    return res.render("auth/login", {
      tituloPagina: "Iniciar Sesion",
      errores: resultado.array(),
      csrfToken: req.csrfToken(),
      usuario: req.usuario
    });
  }

  const { email, password } = req.body;

  // Comprobar si existe
  const usuario = await Usuario.findOne({
    where: { email },
  });

  if (!usuario) {
    return res.render("auth/login", {
      tituloPagina: "Iniciar Sesion",
      csrfToken: req.csrfToken(),
      errores: [{ msg: "El usuario no existe" }],
      usuario: req.usuario
    });
  }

  // Comprobar contraseña
  if (!usuario.verificarPassword(password)) {
    return res.render("auth/login", {
      tituloPagina: "Iniciar Sesion",
      csrfToken: req.csrfToken(),
      errores: [{ msg: "Contraseña incorrecta" }],
      usuario: req.usuario
    });
  }

  // Autenticar el Usuario
  const token = generarJWT({ id: usuario.id, nombre: usuario.nombre });

  // Guardar el token en la base de datos
  await usuario.update({ token });

  // Determinar la URL de redirección según el rol del usuario
  const redirectUrl = (usuario.rol === "admin" || usuario.rol === "recepcionista")
    ? "/panel/admin"
    : "/";

  // Almacenar en una Cookie
  return res
    .cookie("_token", token, {
      httpOnly: true,
      // secure: true,
      // sameSite: true
    })
    .redirect(redirectUrl);
};

const formularioOlvidePassword = (req, res) => {
  res.render("auth/olvide-password", {
    tituloPagina: "Olvide Contraseña",
    csrfToken: req.csrfToken(),
  });
};

const resetPassword = async (req, res) => {
  // Validaciones
  await check("email")
    .isEmail()
    .withMessage("Esto no parece un correo")
    .run(req);

  let resultado = validationResult(req);

  // Verificar que el resultado este vacio
  if (!resultado.isEmpty()) {
    // Errores
    return res.render("auth/olvide-password", {
      tituloPagina: "Olvide contraseña",
      errores: resultado.array(),
      csrfToken: req.csrfToken(),
    });
  }

  // Buscar el usuario

  const { email } = req.body;

  const usuario = await Usuario.findOne({ where: { email } });
  if (!usuario) {
    return res.render("auth/olvide-password", {
      tituloPagina: "Recuperar contraseña",
      csrfToken: req.csrfToken(),
      errores: [{ msg: "El email no existe" }],
    });
  }

  // Generar un token y enviar un email
  usuario.token = generarId();
  await usuario.save();

  // Enviar el correo
  emailOlvidePassword({
    nombre: usuario.nombre,
    email: usuario.email,
    token: usuario.token,
  });

  //Mostrar el mensaje
  res.render("templates/mensaje", {
    tituloPagina: "Restablece la contraseña",
    mensaje: "Hemos enviado un correo de restablecer la contraseña",
  });
};

const formularioRegistro = (req, res) => {
  console.log(req.csrfToken());
  res.render("auth/registro", {
    tituloPagina: "Registro de Usuario",
    csrfToken: req.csrfToken(),
    usuario: req.usuario
  });
};

const registrar = async (req, res) => {
  // Validaciones
  await check("name")
    .notEmpty()
    .withMessage("El nombre no puede estar vacío")
    .run(req);

  await check("email")
    .isEmail()
    .withMessage("El correo electrónico no es válido")
    .run(req);

  await check("password")
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres")
    .run(req);

  await check("password_confirmation")
    .equals(req.body.password)
    .withMessage("Las contraseñas no coinciden")
    .run(req);

  let resultado = validationResult(req);

  // Verificar que el resultado este vacio
  if (!resultado.isEmpty()) {
    // Errores
    return res.render("auth/registro", {
      tituloPagina: "Registro de Usuario",
      errores: resultado.array(),
      csrfToken: req.csrfToken(),
      usuario: req.usuario,
      datosFormulario: {
        nombre: req.body.name,
        email: req.body.email,
      },
    });
  }

  // Extraer los datos
  const { name, email, password } = req.body;

  // Validar que el usuario no exista
  const existeUsuario = await Usuario.findOne({
    where: { email },
  });
  if (existeUsuario) {
    return res.render("auth/registro", {
      tituloPagina: "Registro de Usuario",
      csrfToken: req.csrfToken(),
      errores: [{ msg: "El correo electrónico ya está registrado" }],
      usuario: req.usuario,
      datosFormulario: {
        nombre: req.body.name,
        email: req.body.email,
      },
    });
  }

  // Crear el usuario con rol por defecto
  try {
    const usuario = await Usuario.create({
      nombre: name,
      email,
      password,
      rol: "cliente", // Rol por defecto para nuevos usuarios
    });

    // Autenticar automáticamente después del registro
    const token = generarJWT({ id: usuario.id, nombre: usuario.nombre });

    // Guardar el token en la base de datos
    await usuario.update({ token });

    return res
      .cookie("_token", token, {
        httpOnly: true,
      })
      .redirect("/");
  } catch (error) {
    console.error("Error al crear usuario:", error);
    return res.render("auth/registro", {
      tituloPagina: "Registro de Usuario",
      csrfToken: req.csrfToken(),
      errores: [{ msg: "Error al crear el usuario. Intenta nuevamente" }],
      usuario: req.usuario,
      datosFormulario: {
        nombre: req.body.name,
        email: req.body.email,
      },
    });
  }
};

const comprobarToken = async (req, res) => {
  const { token } = req.params;

  // Validar el token sea verdadero
  const usuario = await Usuario.findOne({ where: { token } });

  if (!usuario) {
    return res.render("auth/confirmar-cuenta", {
      tituloPagina: "Restablece tu contraseña",
      mensaje: "Hubo un error al validar el token",
      error: true,
    });
  }

  // Mostrar formulario para validar la contraseña
  res.render("auth/reset-password", {
    tituloPagina: "Escribe tu nueva contraseña",
    csrfToken: req.csrfToken(),
  });
};

const nuevoPassword = async (req, res) => {
  //Validar contraseñas
  await check("password")
    .isLength({ min: 6 })
    .withMessage("La contraseña debe ser al menos de 6 caracteres")
    .run(req);

  await check("repeat_password")
    .equals(req.body.password)
    .withMessage("La contraseña no es igual")
    .run(req);

  let resultado = validationResult(req);

  // Validar que resultado este vacio
  if (!resultado.isEmpty()) {
    // Errores
    return res.render("auth/reset-password", {
      tituloPagina: "Restablece Contraseña",
      csrfToken: req.csrfToken(),
      errores: resultado.array(),
    });
  }

  const { token } = req.params;
  const { password } = req.body;

  // Identificar el usuario para hacer el cambio
  const usuario = await Usuario.findOne({ where: { token } });

  // Hashear el password
  const salt = await bcrypt.genSalt(10);
  usuario.password = await bcrypt.hash(password, salt);
  usuario.token = null;

  // Guardar en la DB
  await usuario.save();

  res.render("auth/confirmar-cuenta", {
    tituloPagina: "Contraseña cambiada",
    csrfToken: req.csrfToken(),
    mensaje: "La contraseña se cambio correctamente",
  });
};

const cerrarSesion = async (req, res) => {
  // Limpiar el token de la base de datos si hay un usuario autenticado
  if (req.usuario && req.usuario.id) {
    await Usuario.update({ token: null }, { where: { id: req.usuario.id } });
  }
  return res.clearCookie("_token").redirect("/");
};

export {
  formularioLogin,
  autenticar,
  formularioRegistro,
  registrar,
  cerrarSesion,
  formularioOlvidePassword,
  resetPassword,
  comprobarToken,
  nuevoPassword,
}
