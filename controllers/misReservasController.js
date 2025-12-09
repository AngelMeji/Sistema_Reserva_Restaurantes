import { Reserva, Mesa } from "../models/index.js";
import { Op } from "sequelize";

/**
 * Muestra las reservas del usuario autenticado
 */
const mostrarMisReservas = async (req, res) => {
    try {
        const usuario = req.usuario;

        if (!usuario) {
            req.flash("error", "Debes iniciar sesión para ver tus reservas");
            return res.redirect("/auth/login");
        }

        // Obtener todas las reservas del usuario
        const reservas = await Reserva.findAll({
            where: { id_usuario: usuario.id },
            include: [{
                model: Mesa,
                attributes: ['id', 'nombre', 'capacidad', 'zona']
            }],
            order: [
                ['fecha_reserva', 'DESC'],
                ['hora_inicio', 'DESC']
            ]
        });

        // Clasificar reservas
        const ahora = new Date();
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        const reservasActivas = [];
        const reservasPasadas = [];
        const reservasCanceladas = [];

        reservas.forEach(reserva => {
            // CORRECCIÓN: Construir fecha explícitamente en zona horaria local
            // Asumimos formato YYYY-MM-DD
            const [year, month, day] = reserva.fecha_reserva.split('-').map(Number);
            const [hora, minutos] = reserva.hora_inicio.split(':').map(Number);

            // new Date(y, m-1, d, h, m) crea la fecha en tiempo local del servidor
            const fechaReserva = new Date(year, month - 1, day, hora, minutos, 0);

            const tiempoHastaReserva = fechaReserva - ahora;
            const unaHoraEnMs = 60 * 60 * 1000;

            // Agregar propiedad calculada
            const reservaObj = reserva.toJSON();
            // Puede cancelar si falta más de 1 hora Y la reserva no está cancelada/completada
            // NOTA: fechaReserva > ahora ya debería cubrir "Futura" pero nos aseguramos
            reservaObj.puedeCancelar = tiempoHastaReserva > unaHoraEnMs &&
                !['cancelada', 'completada', 'no_show'].includes(reserva.estado);
            reservaObj.tiempoRestante = tiempoHastaReserva;
            reservaObj.esHoy = fechaReserva.toDateString() === hoy.toDateString();
            reservaObj.esFutura = fechaReserva > ahora;

            if (reserva.estado === 'cancelada') {
                reservasCanceladas.push(reservaObj);
            } else if (!reservaObj.esFutura && !reservaObj.esHoy && ['completada', 'no_show'].includes(reserva.estado)) {
                // Solo si YA PASÓ o está completada
                reservasPasadas.push(reservaObj);
            } else if (!reservaObj.esFutura && !reservaObj.esHoy) {
                // Si la fecha y hora ya pasaron, es pasada
                reservasPasadas.push(reservaObj);
            } else {
                // Si es hoy o futura, es activa
                reservasActivas.push(reservaObj);
            }
        });

        // Verificar si hay cambios recientes (últimas 24 horas)
        const hace24Horas = new Date(ahora - 24 * 60 * 60 * 1000);
        const reservasConCambios = reservas.filter(r => {
            const updatedAt = new Date(r.updatedAt);
            const createdAt = new Date(r.createdAt);
            // Si fue actualizado después de ser creado y en las últimas 24 horas
            return updatedAt > createdAt && updatedAt > hace24Horas;
        });

        res.render("usuario/mis-reservas", {
            title: "Mis Reservas",
            pagina: "Mis Reservas",
            usuario,
            csrfToken: req.csrfToken(),
            reservasActivas,
            reservasPasadas,
            reservasCanceladas,
            tieneNotificaciones: reservasConCambios.length > 0,
            notificaciones: reservasConCambios.map(r => ({
                // ID único combinando reserva y timestamp de actualización
                id: `${r.id_reserva}-${new Date(r.updatedAt).getTime()}`,
                mensaje: `Tu reserva #${r.id_reserva} ha sido actualizada`,
                fecha: r.updatedAt,
                estado: r.estado
            }))
        });

    } catch (error) {
        console.error("Error cargando reservas del usuario:", error);
        req.flash("error", "Error al cargar tus reservas");
        res.redirect("/");
    }
};

/**
 * Cancela una reserva del usuario
 */
const cancelarMiReserva = async (req, res) => {
    try {
        const usuario = req.usuario;
        const { id } = req.params;

        if (!usuario) {
            req.flash("error", "Debes iniciar sesión");
            return res.redirect("/auth/login");
        }

        // Buscar la reserva
        const reserva = await Reserva.findOne({
            where: {
                id_reserva: id,
                id_usuario: usuario.id // Asegurar que pertenece al usuario
            }
        });

        if (!reserva) {
            req.flash("error", "Reserva no encontrada");
            return res.redirect("/mis-reservas");
        }

        // Verificar que no esté ya cancelada
        if (reserva.estado === 'cancelada') {
            req.flash("error", "Esta reserva ya está cancelada");
            return res.redirect("/mis-reservas");
        }

        // Verificar que no sea una reserva pasada
        if (['completada', 'no_show'].includes(reserva.estado)) {
            req.flash("error", "No puedes cancelar una reserva que ya fue completada");
            return res.redirect("/mis-reservas");
        }

        // Verificar tiempo de antelación (1 hora antes)
        const ahora = new Date();

        // CORRECCIÓN: Construir fecha explícitamente en zona horaria local
        const [year, month, day] = reserva.fecha_reserva.split('-').map(Number);
        const [hora, minutos] = reserva.hora_inicio.split(':').map(Number);

        // new Date(y, m-1, d, h, m) crea la fecha en tiempo local del servidor
        const fechaReserva = new Date(year, month - 1, day, hora, minutos, 0);

        const tiempoHastaReserva = fechaReserva - ahora;
        const unaHoraEnMs = 60 * 60 * 1000;

        if (tiempoHastaReserva <= unaHoraEnMs) {
            req.flash("error", "No puedes cancelar una reserva con menos de 1 hora de antelación");
            return res.redirect("/mis-reservas");
        }

        // Cancelar la reserva
        await reserva.update({
            estado: 'cancelada',
            observaciones: reserva.observaciones
                ? `${reserva.observaciones} | Cancelada por el usuario el ${ahora.toLocaleString('es-ES')}`
                : `Cancelada por el usuario el ${ahora.toLocaleString('es-ES')}`
        });

        req.flash("exito", `Tu reserva #${id} ha sido cancelada exitosamente`);
        res.redirect("/mis-reservas");

    } catch (error) {
        console.error("Error cancelando reserva:", error);
        req.flash("error", "Error al cancelar la reserva");
        res.redirect("/mis-reservas");
    }
};

/**
 * API para obtener el estado de una reserva (para actualización en tiempo real)
 */
const obtenerEstadoReserva = async (req, res) => {
    try {
        const usuario = req.usuario;
        const { id } = req.params;

        if (!usuario) {
            return res.status(401).json({ error: "No autorizado" });
        }

        const reserva = await Reserva.findOne({
            where: {
                id_reserva: id,
                id_usuario: usuario.id
            },
            include: [{
                model: Mesa,
                attributes: ['id', 'nombre', 'capacidad', 'zona']
            }]
        });

        if (!reserva) {
            return res.status(404).json({ error: "Reserva no encontrada" });
        }

        res.json({
            id: reserva.id_reserva,
            estado: reserva.estado,
            fecha: reserva.fecha_reserva,
            hora_inicio: reserva.hora_inicio,
            hora_fin: reserva.hora_fin,
            mesa: reserva.mesa ? {
                nombre: reserva.mesa.nombre,
                zona: reserva.mesa.zona,
                capacidad: reserva.mesa.capacidad
            } : null,
            updatedAt: reserva.updatedAt
        });

    } catch (error) {
        console.error("Error obteniendo estado:", error);
        res.status(500).json({ error: "Error del servidor" });
    }
};

export {
    mostrarMisReservas,
    cancelarMiReserva,
    obtenerEstadoReserva
};
