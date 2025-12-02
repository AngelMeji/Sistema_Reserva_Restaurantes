import express from "express";
import {
    formularioLogin,
    autenticar,
    formularioRegistro,
    registrar,
    cerrarSesion,
} from "../controllers/usuariosController.js";

const router = express.Router();

// ## Login
router.get("/login", formularioLogin);
router.post("/login", autenticar);

// ## Registro
router.get("/registro", formularioRegistro);
router.post("/registro", registrar);

// ## Cerrar Sesión
router.get("/cerrar-sesion", cerrarSesion);

export default router;