import express from "express";
import { panelPrincipal } from "../controllers/adminController.js";
import protegerRuta from "../middleware/protegerRuta.js";
import rol from "../middleware/administrarRoles.js";

const router = express.Router();

// Panel accesible para Admin y Recepcionista
router.get("/panel/admin", protegerRuta, rol("admin", "recepcionista"), panelPrincipal);

export default router;