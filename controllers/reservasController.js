import { validationResult } from "express-validator";
import { Usuario, Reserva } from "../models/index.js";

const mostrarFormulario = (req, res) => {
    res.render("reservas", {
        title: "Hacer Reserva",
        csrfToken: req.csrfToken(),
        usuario: req.usuario,
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
        } = req.body;

        const usuarioReserva = req.usuario;
        if (!usuarioReserva) {
            return res.status(403).send("No autorizado");
        }

        await Reserva.create({
            id_usuario: usuarioReserva.id,       // El cliente es el mismo usuario
            id_mesa: null,                       // Se asigna después
            fecha_reserva,
            hora_inicio,
            hora_fin: null,                      // El hook la pone a 1.5 horas
            numero_personas,
            estado: "pendiente",
            canal: canal || "web",
            observaciones: observaciones || null,
            creado_por: usuarioReserva.id,       // Quién la creó
        });

        return res.redirect("/");
    } catch (error) {
        console.error("Error creando reserva:", error);

        return res.status(500).render("reservas", {
            title: "Hacer Reserva",
            error: "No se pudo crear la reserva. Por favor inténtelo nuevamente.",
            usuario: req.usuario,
            csrfToken: req.csrfToken(),
        });
    }
};

export { 
    mostrarFormulario, 
    crearReserva
};