import { validationResult } from "express-validator";
import { Usuario, Reserva } from "../models/index.js";

const mostrarFormulario = (req, res) => {
    res.render("reservas", {
        title: "Hacer Reserva",
        csrfToken: req.csrfToken(),
        usuario: req.usuario,
        pagina: "Reservas",
    });
};

const crearReserva = async (req, res) => {
    // Validación
    let resultado = validationResult(req);

    if (!resultado.isEmpty()) {
        return res.status(400).render("reservas", {
            title: "Hacer Reserva",
            errores: resultado.array(),
            usuario: req.usuario,
            csrfToken: req.csrfToken(),
            datos: req.body,
            pagina: "Reservas",
        });
    }

    try {
        const {
            nombre,
            email,
            telefono,
            fecha_reserva,
            hora_inicio,
            numero_personas,
            observaciones,
            canal,
            dispositivo,
        } = req.body;

        const usuarioReserva = req.usuario;
        if (!usuarioReserva) {
            return res.status(403).render("reservas", {
                title: "Hacer Reserva",
                errores: [{ msg: "Debes iniciar sesión para hacer una reserva" }],
                csrfToken: req.csrfToken(),
                pagina: "Reservas",
            });
        }

        // Crear la reserva
        const nuevaReserva = await Reserva.create({
            id_usuario: usuarioReserva.id,
            id_mesa: null,
            fecha_reserva,
            hora_inicio,
            hora_fin: null,
            numero_personas,
            estado: "pendiente",
            canal: canal || "web",
            observaciones: observaciones || null,
            creado_por: usuarioReserva.id,
            dispositivo: dispositivo || "desktop",
        });

        // Verificar que la reserva se creó correctamente
        const reservaCreada = await Reserva.findByPk(nuevaReserva.id_reserva);

        if (reservaCreada) {
            // Redirigir a la página de inicio con mensaje de éxito
            return res.redirect(`/?reserva=${reservaCreada.id_reserva}&mensaje=exito`);
        } else {
            throw new Error("No se pudo verificar la creación de la reserva");
        }

    } catch (error) {
        console.error("Error creando reserva:", error);

        return res.status(500).render("reservas", {
            title: "Hacer Reserva",
            errores: [{ msg: "No se pudo crear la reserva. Por favor inténtelo nuevamente." }],
            usuario: req.usuario,
            csrfToken: req.csrfToken(),
            pagina: "Reservas",
        });
    }
};

export {
    mostrarFormulario,
    crearReserva
};