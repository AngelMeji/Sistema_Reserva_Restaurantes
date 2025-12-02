import { check, validationResult } from "express-validator";
import bcrypt from "bcrypt";
import { generarId, generarJWT } from "../helpers/tokens.js";
import Usuario from "../models/Usuarios.js";

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

  // Almacenar en una Cookie
  return res
    .cookie("_token", token, {
      httpOnly: true,
      // secure: true,
      // sameSite: true
    })
    .redirect("/");
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
      usuario: {
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
      usuario: {
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
      rol: "recepcionista", // Rol por defecto para nuevos usuarios
    });

    // Autenticar automáticamente después del registro
    const token = generarJWT({ id: usuario.id, nombre: usuario.nombre });

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
      usuario: {
        nombre: req.body.name,
        email: req.body.email,
      },
    });
  }
};

const cerrarSesion = (req, res) => {
  return res.clearCookie("_token").redirect("/");
};

export {
  formularioLogin,
  autenticar,
  formularioRegistro,
  registrar,
  cerrarSesion,
}
