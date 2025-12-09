// misReservasRoutes.js
import express from "express";
import {
    mostrarMisReservas,
    cancelarMiReserva,
    obtenerEstadoReserva
} from "../controllers/misReservasController.js";
import protegerRuta from "../middleware/protegerRuta.js";

const router = express.Router();

// Ver mis reservas
router.get("/", protegerRuta, mostrarMisReservas);

// Cancelar una reserva
router.post("/:id/cancelar", protegerRuta, cancelarMiReserva);

// API para obtener estado en tiempo real
router.get("/api/:id/estado", protegerRuta, obtenerEstadoReserva);

export default router;
