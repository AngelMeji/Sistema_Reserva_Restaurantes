// routes/mesas.js
import express from "express";
import { listarMesas, 
    mostrarCrearMesa, 
    crearMesa, 
    mostrarEditarMesa, 
    editarMesa, 
    eliminarMesa 
} from "../controllers/mesasController.js";
import protegerRuta from "../middleware/protegerRuta.js";
import rol from "../middleware/administrarRoles.js";

const router = express.Router();

router.get("/mesas", protegerRuta, rol("admin","recepcionista"), listarMesas);
router.get("/mesas/crear", protegerRuta, rol("admin","recepcionista"), mostrarCrearMesa);
router.post("/mesas/crear", protegerRuta, rol("admin","recepcionista"), crearMesa);
router.get("/mesas/:id/editar", protegerRuta, rol("admin","recepcionista"), mostrarEditarMesa);
router.post("/mesas/:id/editar", protegerRuta, rol("admin","recepcionista"), editarMesa);
router.post("/mesas/:id/eliminar", protegerRuta, rol("admin","recepcionista"), eliminarMesa);

export default router;
