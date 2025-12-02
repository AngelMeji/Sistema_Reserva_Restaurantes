import jwt from "jsonwebtoken";
import Usuario from "../models/Usuarios.js";

const protegerRuta = async (req, res, next) => {
    // Verificar si hay un token
    const { _token } = req.cookies;
    if (!_token) {
        return res.redirect("/auth/login");
    }

    // Comprobar el token
    try {
        const decoded = jwt.verify(_token, process.env.JWT_SECRET);
        const usuario = await Usuario.scope("eliminarPassword").findByPk(decoded.id);

        // Almacenar el usuario en el req
        if (usuario) {
            req.usuario = usuario;
            return next();
        } else {
            return res.redirect("/auth/login");
        }
    } catch (error) {
        return res.clearCookie("_token").redirect("/auth/login");
    }
};

const identificarUsuario = async (req, res, next) => {
    // Verificar si hay un token
    const { _token } = req.cookies;

    if (!_token) {
        req.usuario = null;
        return next();
    }

    // Comprobar el token
    try {
        const decoded = jwt.verify(_token, process.env.JWT_SECRET);
        const usuario = await Usuario.scope("eliminarPassword").findByPk(decoded.id);

        // Almacenar el usuario en el req
        if (usuario) {
            req.usuario = usuario;
        } else {
            req.usuario = null;
        }

        return next();
    } catch (error) {
        req.usuario = null;
        return res.clearCookie("_token").next();
    }
};

export { protegerRuta, identificarUsuario };
