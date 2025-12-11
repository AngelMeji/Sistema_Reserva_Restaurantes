import Reserva from "../models/Reservas.js";
import Usuario from "../models/Usuarios.js";
import Mesa from "../models/Mesas.js";

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
            csrfToken: req.csrfToken(),
            usuario: req.usuario,
            totalReservas,
            reservasHoy,
            totalUsuarios
        });
    } catch (error) {
        console.log(error);
    }
};

const verReservas = async (req, res) => {
    try {
        const reservas = await Reserva.findAll({
            include: [
                { model: Usuario, as: "usuario", attributes: ["nombre", "email", "telefono"] },
                { model: Mesa, attributes: ["id", "nombre", "capacidad", "zona", "estado"] }
            ],
            order: [["fecha_reserva", "DESC"], ["hora_inicio", "ASC"]]
        });

        res.render("panel/reservas", {
            title: "Gestión de Reservas",
            usuario: req.usuario,
            reservas,
            csrfToken: req.csrfToken()
        });
    } catch (error) {
        console.log(error);
    }
};

const cambiarEstadoReserva = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        const estadosValidos = ["pendiente", "confirmada", "en_curso", "completada", "cancelada", "no_show"];

        if (!estadosValidos.includes(estado)) {
            return res.status(400).json({ error: "Estado no válido" });
        }

        const reserva = await Reserva.findByPk(id);

        if (!reserva) {
            return res.status(404).json({ error: "Reserva no encontrada" });
        }

        await reserva.update({ estado });

        // Redirigir de vuelta a la lista de reservas
        res.redirect("/admin/reservas");
    } catch (error) {
        console.error("Error al cambiar estado:", error);
        res.status(500).json({ error: "Error al actualizar la reserva" });
    }
};

const eliminarReserva = async (req, res) => {
    try {
        const { id } = req.params;

        const reserva = await Reserva.findByPk(id);

        if (!reserva) {
            return res.status(404).json({ error: "Reserva no encontrada" });
        }

        await reserva.destroy();

        res.redirect("/admin/reservas");
    } catch (error) {
        console.error("Error al eliminar reserva:", error);
        res.status(500).json({ error: "Error al eliminar la reserva" });
    }
};

const reagendarReserva = async (req, res) => {
    try {
        const { id } = req.params;
        const { fecha_reserva, hora_inicio, motivo_reagendamiento } = req.body;

        const reserva = await Reserva.findByPk(id, {
            include: [{ model: Usuario, as: "usuario", attributes: ["nombre", "email"] }]
        });

        if (!reserva) {
            return res.status(404).json({ error: "Reserva no encontrada" });
        }

        // Guardar datos anteriores para la notificación
        const fechaAnterior = reserva.fecha_reserva;
        const horaAnterior = reserva.hora_inicio;

        // Calcular nueva hora de fin (90 minutos después)
        const [h, m] = hora_inicio.split(":").map(Number);
        const finDate = new Date();
        finDate.setHours(h, m, 0);
        finDate.setMinutes(finDate.getMinutes() + 90);
        const hora_fin = `${finDate.getHours().toString().padStart(2, "0")}:${finDate.getMinutes().toString().padStart(2, "0")}:00`;

        // Actualizar la reserva
        await reserva.update({
            fecha_reserva,
            hora_inicio,
            hora_fin,
            observaciones: reserva.observaciones
                ? `${reserva.observaciones} | Reagendada el ${new Date().toLocaleDateString('es-ES')}: ${motivo_reagendamiento || 'Sin motivo especificado'}`
                : `Reagendada el ${new Date().toLocaleDateString('es-ES')}: ${motivo_reagendamiento || 'Sin motivo especificado'}`
        });

        // Log para notificación (en un sistema real aquí se enviaría el email)
        console.log(`📧 NOTIFICACIÓN DE REAGENDAMIENTO:`);
        console.log(`   Cliente: ${reserva.usuario?.nombre || 'N/A'} (${reserva.usuario?.email || 'N/A'})`);
        console.log(`   Reserva #${id} reagendada`);
        console.log(`   De: ${fechaAnterior} ${horaAnterior}`);
        console.log(`   A: ${fecha_reserva} ${hora_inicio}`);
        console.log(`   Motivo: ${motivo_reagendamiento || 'No especificado'}`);

        res.redirect("/admin/reservas");
    } catch (error) {
        console.error("Error al reagendar reserva:", error);
        res.status(500).json({ error: "Error al reagendar la reserva" });
    }
};

const verUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.findAll();
        res.render("panel/usuarios", {
            title: "Gestión de Usuarios",
            usuario: req.usuario,
            usuarios,
            csrfToken: req.csrfToken()
        });
    } catch (error) {
        console.log(error);
    }
};

const cambiarRolUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { rol } = req.body;

        // Validar que el rol sea 'cliente' (usuario) o 'recepcionista' según requerimiento
        if (!['cliente', 'recepcionista'].includes(rol)) {
            // Si intenta enviar otro rol, ignoramos o damos error.
            // Para mantener fluidez, redirigimos con un error flash sería ideal,
            // pero por simplicidad redirigimos.
            return res.redirect("/admin/usuarios");
        }

        const usuario = await Usuario.findByPk(id);
        if (!usuario) {
            return res.redirect("/admin/usuarios");
        }

        await usuario.update({ rol });

        res.redirect("/admin/usuarios");
    } catch (error) {
        console.error("Error al cambiar rol:", error);
        res.redirect("/admin/usuarios");
    }
};

export { panelPrincipal, verReservas, cambiarEstadoReserva, eliminarReserva, reagendarReserva, verUsuarios, cambiarRolUsuario };