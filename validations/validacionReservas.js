import { body } from "express-validator";

const validarReserva = [
    body("nombre").notEmpty().withMessage("El Nombre es Obligatorio"),
    body("email").isEmail().withMessage("Esto no parece un correo"),
    body("telefono").isNumeric().withMessage("El Telefono debe contener números"),

    body("fecha_reserva")
        .notEmpty().withMessage("La fecha es obligatoria")
        .isISO8601().withMessage("Formato de fecha inválido")
        .custom((value) => {
            // Obtener fecha actual en formato YYYY-MM-DD (zona horaria local)
            const hoy = new Date();
            const hoyStr = hoy.getFullYear() + '-' +
                String(hoy.getMonth() + 1).padStart(2, '0') + '-' +
                String(hoy.getDate()).padStart(2, '0');

            // Comparar strings directamente para evitar problemas de zona horaria
            if (value < hoyStr) {
                throw new Error("La fecha no puede ser anterior a hoy");
            }
            return true;
        }),

    body("hora_inicio")
        .notEmpty().withMessage("La hora es obligatoria"),

    body("numero_personas")
        .isInt({ min: 1, max: 20 }).withMessage("El número de personas debe estar entre 1 y 20"),

    body("dispositivo")
        .optional()
        .isIn(['mobile', 'desktop', 'tablet']).withMessage("Tipo de dispositivo inválido"),
];

export { validarReserva };