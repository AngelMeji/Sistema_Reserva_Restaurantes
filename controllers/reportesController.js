// controllers/reportesController.js
import Reserva from "../models/Reservas.js";
import Mesa from "../models/Mesas.js";
import { Op, Sequelize } from "sequelize";

const reporteResumen = async (req, res) => {
    try {
        // últimos 30 días - reservas por día
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() - 29);
        const fechaLimiteStr = fechaLimite.toISOString().split("T")[0];

        const reservasPorDia = await Reserva.findAll({
        attributes: [
            [Sequelize.fn('DATE', Sequelize.col('fecha_reserva')), 'fecha'],
            [Sequelize.fn('COUNT', Sequelize.col('id_reserva')), 'cantidad']
        ],
        where: {
            fecha_reserva: { [Op.gte]: fechaLimiteStr }
        },
        group: [Sequelize.fn('DATE', Sequelize.col('fecha_reserva'))],
        order: [[Sequelize.fn('DATE', Sequelize.col('fecha_reserva')), 'ASC']]
        });

        // top días (últimos 90)
        const fecha90 = new Date();
        fecha90.setDate(fecha90.getDate() - 89);
        const fecha90Str = fecha90.toISOString().split("T")[0];

        const topDias = await Reserva.findAll({
        attributes: [
            [Sequelize.fn('DATE', Sequelize.col('fecha_reserva')), 'fecha'],
            [Sequelize.fn('COUNT', Sequelize.col('id_reserva')), 'cantidad']
        ],
        where: { fecha_reserva: { [Op.gte]: fecha90Str } },
        group: [Sequelize.fn('DATE', Sequelize.col('fecha_reserva'))],
        order: [[Sequelize.fn('COUNT', Sequelize.col('id_reserva')), 'DESC']],
        limit: 7
        });

        // no-shows (últimos 120 días)
        const fecha120 = new Date();
        fecha120.setDate(fecha120.getDate() - 119);
        const fecha120Str = fecha120.toISOString().split("T")[0];

        const noShows = await Reserva.count({
        where: {
            estado: "no_show",
            fecha_reserva: { [Op.gte]: fecha120Str }
        }
        });

        // ocupación por mesa (últimos 30)
        const ocupacionMesas = await Reserva.findAll({
            attributes: ['id_mesa', [Sequelize.fn('COUNT', Sequelize.col('id_reserva')), 'reservas']],
            where: { fecha_reserva: { [Op.gte]: fechaLimiteStr } },
            group: ['id_mesa'],
            include: [{ model: Mesa, attributes: ['nombre','capacidad'], required: false }],
            order: [[Sequelize.fn('COUNT', Sequelize.col('id_reserva')), 'DESC']]
        });

        res.render("panel/reportes", {
            csrfToken: req.csrfToken(),
            reservasPorDia,
            topDias,
            noShows,
            ocupacionMesas,
            usuario: req.usuario,
            messages: req.flash()
        });
    } catch (error) {
        req.flash("error","Error generando reportes: " + error.message);
        res.redirect("/panel/admin");
    }
};

export{ reporteResumen };