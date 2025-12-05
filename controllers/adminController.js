import Reserva from "../models/Reservas.js";
import Usuario from "../models/Usuarios.js";

const panelPrincipal = async (req, res) => {
    try {
        // Datos básicos (para tarjetas)
        const totalReservas = await Reserva.count();
        const reservasHoy = await Reserva.count({
            where: { fecha_reserva: new Date().toISOString().split("T")[0] }
        });

        const totalUsuarios = await Usuario.count();

        res.render("panel/admin", {
            title: "Panel de Control",
            usuario: req.usuario,
            totalReservas,
            reservasHoy,
            totalUsuarios
        });
    } catch (error) {
        console.log(error);
    }
};

export { panelPrincipal };