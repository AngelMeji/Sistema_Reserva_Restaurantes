// reservasRoutes.js
import express from "express";
import { mostrarFormulario, crearReserva } from "../controllers/reservasController.js";

const router = express.Router();

// Mostrar formulario de reserva
router.get("/", mostrarFormulario);

// Procesar formulario de reserva
router.post("/", crearReserva);

export default router;
