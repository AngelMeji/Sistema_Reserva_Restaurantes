import express from "express";
import {
    formularioLogin,
    autenticar,
    formularioRegistro,
    formularioOlvidePassword,
    resetPassword,
    registrar,
    comprobarToken,
    nuevoPassword,
    cerrarSesion,
} from "../controllers/usuariosController.js";

const router = express.Router();

// ## Login
router.get("/login", formularioLogin);
router.post("/login", autenticar);

// ## Registro
router.get("/registro", formularioRegistro);
router.post("/registro", registrar);

// ## Olvidar Contraseña
router.get("/olvide-password", formularioOlvidePassword);
router.post("/olvide-password", resetPassword);

// Validacion de Contraseñas (Olvide Password)
router.get("/olvide-password/:token", comprobarToken);
router.post("/olvide-password/:token", nuevoPassword);

// ## Cerrar Sesión
router.get("/cerrar-sesion", cerrarSesion);

export default router;