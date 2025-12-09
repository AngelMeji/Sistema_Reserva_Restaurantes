// routes/horarios.js
import express from "express";
import protegerRuta from "../middleware/protegerRuta.js";
import rol from "../middleware/administrarRoles.js";
import {
    listarHorarios,
    crearHorario,
    editarHorario,
    eliminarHorario,
    verPoliticas,
    actualizarPolitica
} from "../controllers/horariosController.js";

const router = express.Router();

// Página principal de configuración
router.get("/config", protegerRuta, rol("admin"), listarHorarios);

// Operaciones CRUD de horarios
router.post("/config/horarios/crear", protegerRuta, rol("admin"), crearHorario);
router.post("/config/horarios/:id/editar", protegerRuta, rol("admin"), editarHorario);
router.post("/config/horarios/:id/eliminar", protegerRuta, rol("admin"), eliminarHorario);

// Políticas
router.get("/config/politicas", protegerRuta, rol("admin"), verPoliticas);
router.post("/config/politicas/actualizar", protegerRuta, rol("admin"), actualizarPolitica);

export default router;
