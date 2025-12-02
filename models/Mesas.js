import { DataTypes } from "sequelize";
import db from "../config/db.js";

const Mesa = db.define(
    "mesas",
    {
        nombre: {
            type: DataTypes.STRING,
            allowNull: false,
            // Puede ser "Mesa 1", "Mesa 10", "VIP 3", etc.
        },
        capacidad: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        zona: {
            type: DataTypes.STRING,
            allowNull: true,
            // Ej: "interior", "terraza", "barra", "privado"
        },
        estado: {
            type: DataTypes.ENUM("activa", "inactiva"),
            allowNull: false,
            defaultValue: "activa",
        },
    },
);

export default Mesa;