import { DataTypes } from "sequelize";
import db from "../config/db.js";

const ConfiguracionRestaurante = db.define(
  "configuracion_restaurante",
  {
    id_config: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nombre_restaurante: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    direccion: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    telefono: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email_notificaciones: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    duracion_estandar_reserva: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 120, // 2 horas
    },
    intervalo_reservas: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30,
    },
    max_reservas_por_franga: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3,
    },
    tiempo_max_cancelacion_antes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 120,
    },
    tiempo_max_retraso: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 15,
    },
  },
  {
    timestamps: true,
  }
);

export default ConfiguracionRestaurante;