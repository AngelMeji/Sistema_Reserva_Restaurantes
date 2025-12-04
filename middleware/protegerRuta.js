import jwt from "jsonwebtoken";
import { Usuario } from "../models/index.js";

const protegerRuta = async (req, res, next) => {
  // Verificar si hay un token
  const { _token } = req.cookies;
  if (!_token) {
    return res.redirect("/auth/login");
  }
  // Validar el token
  try {
    const decoded = jwt.verify(_token, process.env.JWT_SECRETA);
    const usuario = await Usuario.findByPk(decoded.id);

    // Verificar que el usuario existe, está activo y el token coincide
    if (usuario && usuario.estado === "activo" && usuario.token === _token) {
      // Eliminar password antes de asignarlo a req.usuario
      const { password, ...usuarioSinPassword } = usuario.toJSON();
      req.usuario = usuarioSinPassword;
      return next();
    } else {
      return res.clearCookie("_token").redirect("/auth/login");
    }
  } catch (error) {
    return res.clearCookie("_token").redirect("/auth/login");
  }
};

export default protegerRuta;
