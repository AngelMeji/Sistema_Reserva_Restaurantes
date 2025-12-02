import { DataTypes } from "sequelize";
import db from "../config/db.js";

const Cliente = db.define(
    "clientes",
    {
        nombre_completo: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        telefono: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        email: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        
        notas: {
            type: DataTypes.TEXT,
            allowNull: true,
            // Aquí se pueden guardar alergias, preferencias, detalles, etc.
        },
    },
    {
        tableName: "clientes",
        timestamps: true, // createdAt y updatedAt
    }
);

export default Cliente;