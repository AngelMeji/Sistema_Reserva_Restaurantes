// reservasRoutes.js
import express from "express";
import { mostrarFormulario, crearReserva } from "../controllers/reservasController.js";
import protegerRuta from "../middleware/protegerRuta.js";
import { validarReserva } from "../validations/validacionReservas.js";

const router = express.Router();

// Mostrar formulario de reserva
router.get("/", protegerRuta, mostrarFormulario);

// Procesar formulario de reserva
router.post("/", protegerRuta, validarReserva, crearReserva);

export default router;
