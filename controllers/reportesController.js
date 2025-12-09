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

        // Estadísticas por día de la semana (últimos 90 días)
        const reservasPorDiaSemana = await Reserva.findAll({
            attributes: [
                [Sequelize.fn('DAYOFWEEK', Sequelize.col('fecha_reserva')), 'dia_semana'],
                [Sequelize.fn('COUNT', Sequelize.col('id_reserva')), 'cantidad']
            ],
            where: { fecha_reserva: { [Op.gte]: fecha90Str } },
            group: [Sequelize.fn('DAYOFWEEK', Sequelize.col('fecha_reserva'))],
            order: [[Sequelize.fn('COUNT', Sequelize.col('id_reserva')), 'DESC']]
        });

        // Mapear días de la semana
        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const reservasDiaSemanaFormatted = reservasPorDiaSemana.map(r => ({
            dia: diasSemana[r.get('dia_semana') - 1] || 'Desconocido',
            cantidad: r.get('cantidad')
        }));

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

        // Total reservas en el período
        const totalReservas120 = await Reserva.count({
            where: { fecha_reserva: { [Op.gte]: fecha120Str } }
        });

        // Calcular tasa de no-show
        const tasaNoShow = totalReservas120 > 0 ? ((noShows / totalReservas120) * 100).toFixed(1) : 0;

        // Estadísticas por estado
        const estadisticasPorEstado = await Reserva.findAll({
            attributes: [
                'estado',
                [Sequelize.fn('COUNT', Sequelize.col('id_reserva')), 'cantidad']
            ],
            where: { fecha_reserva: { [Op.gte]: fecha90Str } },
            group: ['estado'],
            order: [[Sequelize.fn('COUNT', Sequelize.col('id_reserva')), 'DESC']]
        });

        // Estadísticas por canal
        const estadisticasPorCanal = await Reserva.findAll({
            attributes: [
                'canal',
                [Sequelize.fn('COUNT', Sequelize.col('id_reserva')), 'cantidad']
            ],
            where: { fecha_reserva: { [Op.gte]: fecha90Str } },
            group: ['canal'],
            order: [[Sequelize.fn('COUNT', Sequelize.col('id_reserva')), 'DESC']]
        });

        // Promedio de personas por reserva
        const promedioPersonas = await Reserva.findOne({
            attributes: [
                [Sequelize.fn('AVG', Sequelize.col('numero_personas')), 'promedio']
            ],
            where: { fecha_reserva: { [Op.gte]: fecha90Str } }
        });

        // Hora más popular
        const horasMasPopulares = await Reserva.findAll({
            attributes: [
                [Sequelize.fn('HOUR', Sequelize.col('hora_inicio')), 'hora'],
                [Sequelize.fn('COUNT', Sequelize.col('id_reserva')), 'cantidad']
            ],
            where: { fecha_reserva: { [Op.gte]: fecha90Str } },
            group: [Sequelize.fn('HOUR', Sequelize.col('hora_inicio'))],
            order: [[Sequelize.fn('COUNT', Sequelize.col('id_reserva')), 'DESC']],
            limit: 5
        });

        // ocupación por mesa (últimos 30)
        const ocupacionMesas = await Reserva.findAll({
            attributes: ['id_mesa', [Sequelize.fn('COUNT', Sequelize.col('id_reserva')), 'reservas']],
            where: {
                fecha_reserva: { [Op.gte]: fechaLimiteStr },
                id_mesa: { [Op.not]: null }
            },
            group: ['id_mesa'],
            include: [{ model: Mesa, attributes: ['nombre', 'capacidad', 'zona'], required: false }],
            order: [[Sequelize.fn('COUNT', Sequelize.col('id_reserva')), 'DESC']]
        });

        // Total de reservas (últimos 30 días)
        const totalReservas30 = await Reserva.count({
            where: { fecha_reserva: { [Op.gte]: fechaLimiteStr } }
        });

        // Reservas confirmadas vs pendientes
        const reservasConfirmadas = await Reserva.count({
            where: {
                fecha_reserva: { [Op.gte]: fechaLimiteStr },
                estado: "confirmada"
            }
        });

        const reservasCanceladas = await Reserva.count({
            where: {
                fecha_reserva: { [Op.gte]: fecha90Str },
                estado: "cancelada"
            }
        });

        res.render("panel/reportes", {
            csrfToken: req.csrfToken(),
            reservasPorDia,
            topDias,
            noShows,
            tasaNoShow,
            ocupacionMesas,
            usuario: req.usuario,
            messages: req.flash(),
            reservasDiaSemanaFormatted,
            estadisticasPorEstado,
            estadisticasPorCanal,
            promedioPersonas: promedioPersonas?.get('promedio') ? parseFloat(promedioPersonas.get('promedio')).toFixed(1) : 0,
            horasMasPopulares,
            totalReservas30,
            reservasConfirmadas,
            reservasCanceladas,
            totalReservas120
        });
    } catch (error) {
        console.error("Error en reportes:", error);
        req.flash("error", "Error generando reportes: " + error.message);
        res.redirect("/panel/admin");
    }
};

export { reporteResumen };