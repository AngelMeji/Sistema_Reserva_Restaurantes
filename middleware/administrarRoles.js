const rol = (...rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.usuario) {
            return res.redirect("/auth/login");
        }

        if (!rolesPermitidos.includes(req.usuario.rol)) {
            return res.status(403).render("403", {
                title: "Acceso Denegado",
                csrfToken: req.csrfToken(),
                usuario: req.usuario,
                mensaje: "No tienes permisos para acceder a esta sección."
            });
        }

        next();
    };
};

export default rol;