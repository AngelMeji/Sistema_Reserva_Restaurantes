import express from "express";
import { panelPrincipal, verReservas, cambiarEstadoReserva, eliminarReserva, reagendarReserva, verUsuarios, cambiarRolUsuario } from "../controllers/adminController.js";
import { reporteResumen } from "../controllers/reportesController.js";
import protegerRuta from "../middleware/protegerRuta.js";
import rol from "../middleware/administrarRoles.js";

const router = express.Router();

// Panel accesible para Admin y Recepcionista
router.get("/panel/admin", protegerRuta, rol("admin", "recepcionista"), panelPrincipal);

// Gestión de Reservas
router.get("/admin/reservas", protegerRuta, rol("admin", "recepcionista"), verReservas);
router.post("/admin/reservas/:id/estado", protegerRuta, rol("admin", "recepcionista"), cambiarEstadoReserva);
router.post("/admin/reservas/:id/reagendar", protegerRuta, rol("admin", "recepcionista"), reagendarReserva);
router.post("/admin/reservas/:id/eliminar", protegerRuta, rol("admin", "recepcionista"), eliminarReserva);

// Gestión de Usuarios (Solo Admin)
router.get("/admin/usuarios", protegerRuta, rol("admin"), verUsuarios);
router.post("/admin/usuarios/:id/rol", protegerRuta, rol("admin"), cambiarRolUsuario);

router.get("/admin/reportes", protegerRuta, rol("admin", "recepcionista"), reporteResumen);

export default router;