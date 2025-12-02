import { DataTypes } from "sequelize";
import bcrypt from "bcrypt";
import db from "../config/db.js";

const Usuario = db.define(
    "usuarios",
    {
        nombre: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },

        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        rol: {
            type: DataTypes.ENUM("admin", "recepcionista", "mesero"),
            allowNull: false,
        },

        estado: {
            type: DataTypes.ENUM("activo", "inactivo"),
            defaultValue: "activo",
        },
    },
    {
        hooks: {
            beforeSave: async (usuario) => {
                if (usuario.changed("password")) {
                    const salt = await bcrypt.genSalt(10);
                    usuario.password = await bcrypt.hash(usuario.password, salt);
                }
            },
        },
        scopes: {
            eliminarPassword: {
                attributes: {
                    exclude: ["password", "createdAt", "updatedAt"],
                },
            },
        },
    }
);

// Metodo Personalizado
Usuario.prototype.verificarPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

export default Usuario;
