import express from "express";
import {
    formularioLogin,
    autenticar,
    formularioRegistro,
    registrar,
} from "../controllers/usuariosController.js";

const router = express.Router();

// ## Login
router.get("/login", formularioLogin);
router.post("/login", autenticar);

// ## Registro
router.get("/registro", formularioRegistro);
router.post("/registro", registrar);

export default router;