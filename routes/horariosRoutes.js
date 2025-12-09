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

router.get("/config", protegerRuta, rol("admin"), listarHorarios);
router.post("/config/crear", protegerRuta, rol("admin"), crearHorario);
router.post("/config/:id/editar", protegerRuta, rol("admin"), editarHorario);
router.post("/config/:id/eliminar", protegerRuta, rol("admin"), eliminarHorario);

router.get("/config/politicas", protegerRuta, rol("admin"), verPoliticas);
router.post("/config/politicas/actualizar", protegerRuta, rol("admin"), actualizarPolitica);

export default router;
