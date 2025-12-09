import { DataTypes } from "sequelize";
import db from "../config/db.js";

const PoliticaReserva = db.define("politicas_reserva", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tiempo_cancelacion_min: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 60
    },
    tiempo_anticipacion_horas: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    max_personas_por_reserva: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 8
    },
    duracion_default_min: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 90
    }
});

export default PoliticaReserva;