const rol = (...rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.usuario) {
            return res.redirect("/auth/login");
        }

        if (!rolesPermitidos.includes(req.usuario.rol)) {
            // Redirigir a la página de inicio con mensaje de error
            req.flash('error', 'No tienes permisos para acceder a esta sección.');
            return res.redirect("/");
        }

        next();
    };
};

export default rol;