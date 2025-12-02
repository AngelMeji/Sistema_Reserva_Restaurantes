import { DataTypes } from "sequelize";
import db from "../config/db.js";

const Reserva = db.define(
    "reservas",
    {
        id_reserva: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        id_cliente: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        id_mesa: {
            type: DataTypes.INTEGER,
            allowNull: true, // Se asigna después si no hay mesa
        },

        fecha_reserva: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },

        hora_inicio: {
            type: DataTypes.TIME,
            allowNull: false,
        },

        hora_fin: {
            type: DataTypes.TIME,
            allowNull: true,
        },

        numero_personas: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: { min: 1 },
        },

        estado: {
            type: DataTypes.ENUM(
                "pendiente",
                "confirmada",
                "en_curso",
                "completada",
                "cancelada",
                "no_show"
            ),
            allowNull: false,
            defaultValue: "pendiente",
        },

        canal: {
            type: DataTypes.ENUM("web", "telefono", "presencial"),
            allowNull: false,
        },

        observaciones: {
            type: DataTypes.TEXT,
            allowNull: true,
        },

        creado_por: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        hooks: {
            beforeCreate: (reserva) => {
                if (!reserva.hora_fin) {
                    // Duración por defecto: 2 horas
                    const [h, m] = reserva.hora_inicio.split(":").map(Number);
                    const fin = new Date();
                    fin.setHours(h + 2, m, 0);

                    reserva.hora_fin = `${fin.getHours().toString().padStart(2, "0")}:${fin.getMinutes().toString().padStart(2, "0")}:00`;
                }
            },
        },
    }
);

export default Reserva;