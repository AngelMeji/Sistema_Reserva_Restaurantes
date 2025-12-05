import jwt from "jsonwebtoken";
import Usuario from "../models/Usuarios.js";

const identificarUsuario = async (req, res, next) => {
    // Verificar si hay un token
    const { _token } = req.cookies;

    if (!_token) {
        req.usuario = null;
        return next();
    }

    // Comprobar el token
    try {
        const decoded = jwt.verify(_token, process.env.JWT_SECRETA);
        const usuario = await Usuario.findByPk(decoded.id);

        // Verificar que el usuario existe, está activo y el token coincide con el de la BD
        if (usuario && usuario.estado === "activo" && usuario.token === _token) {
            // Eliminar password antes de asignarlo a req.usuario
            const { password, ...usuarioSinPassword } = usuario.toJSON();
            req.usuario = usuarioSinPassword;
        } else {
            req.usuario = null;
            // Limpiar cookie si el token no es válido
            res.clearCookie("_token");
        }

        return next();
    } catch (error) {
        req.usuario = null;
        res.clearCookie("_token");
        return next();
    }
};

export { identificarUsuario };
