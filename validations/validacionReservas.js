import { body } from "express-validator";

const validarReserva = [
    body("nombre").notEmpty().withMessage("El Nombre es Obligatorio"),
    body("email").isEmail().withMessage("Esto no parece un correo"),
    body("telefono").isNumeric().withMessage("El Telefono debe contener números"),

    body("fecha_reserva")
        .notEmpty().withMessage("La fecha es obligatoria")
        .custom((value) => {
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            const fecha = new Date(value);
            if (fecha < hoy) throw new Error("La fecha no puede ser anterior a hoy");
            return true;
        }),

    body("hora_inicio")
        .notEmpty().withMessage("La hora es obligatoria")
        .custom((value) => {
            const apertura = "10:00";
            const cierre = "22:00";
            if (value < apertura || value > cierre) {
                throw new Error("La hora debe estar entre 10:00 y 22:00");
            }
            return true;
        }),

    body("numero_personas")
        .isInt({ min: 1 }).withMessage("Debe haber mínimo 1 persona"),
];

export { validarReserva };