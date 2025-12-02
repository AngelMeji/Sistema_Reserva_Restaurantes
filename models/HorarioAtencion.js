import { DataTypes } from "sequelize"; 
import db from "../config/db.js"; 
const HorarioAtencion = db.define( 
    "horarios_atencion", 
    { 
        id_horario: { 
            type: DataTypes.INTEGER, 
            autoIncrement: true, 
            primaryKey: true, 
        }, 
        dia_semana: { 
            type: DataTypes.INTEGER, // 0 a 6 
            allowNull: false, 
        }, 
        hora_apertura: { 
            type: DataTypes.TIME, 
            allowNull: false, 
        }, 
        hora_cierre: { 
            type: DataTypes.TIME, 
            allowNull: false, 
        }, 
        activo: { 
            type: DataTypes.BOOLEAN, 
            defaultValue: true, 
        }, 
    } 
); 

export default HorarioAtencion;