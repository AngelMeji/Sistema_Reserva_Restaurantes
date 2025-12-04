// reservasController.js
// Controller for handling reservation views and creation
import Reserva from "../models/Reservas.js";

/**
 * Render the reservation form view.
 */
export const mostrarFormulario = (req, res) => {
    res.render("reservas", {
        title: "Hacer Reserva",
        usuario: req.usuario,
    });
};

/**
 * Process reservation form submission and create a new reservation record.
 */
export const crearReserva = async (req, res) => {
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

        // Assuming there is a Cliente model to associate the reservation with.
        // For simplicity, we will store the client info directly in the reservation
        // if the schema had fields for them. Since the current Reserva model does not
        // include these fields, we will just create the reservation with the fields
        // that exist. You may need to adjust the model later.

        await Reserva.create({
            // id_cliente should reference an existing client; here we set a placeholder.
            id_cliente: 1, // TODO: replace with actual client ID lookup/creation
            id_mesa: null,
            fecha_reserva,
            hora_inicio,
            hora_fin: null, // will be set by hook if not provided
            numero_personas,
            estado: "pendiente",
            canal: canal || "web",
            observaciones: observaciones || null,
            creado_por: req.usuario ? req.usuario.id : 0,
        });
        // After successful creation, redirect to home with a flash/message (simplified)
        res.redirect("/");
    } catch (error) {
        console.error("Error creando reserva:", error);
        // Render the form again with an error message
        res.status(500).render("reservas", {
            title: "Hacer Reserva",
            error: "No se pudo crear la reserva. Por favor, intente nuevamente.",
            usuario: req.usuario,
        });
    }
};
