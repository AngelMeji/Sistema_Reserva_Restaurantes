import Mesa from "../models/Mesas.js";
import Reserva from "../models/Reservas.js";
import { Op } from "sequelize";

const listarMesas = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 5; // 5 mesas por página
        const offset = (page - 1) * limit;

        const { count, rows: mesas } = await Mesa.findAndCountAll({
            order: [["id", "ASC"]],
            limit,
            offset
        });

        const totalPages = Math.ceil(count / limit);

        // Calcular ocupación de mesas para hoy
        const hoy = new Date().toISOString().split("T")[0];
        const horaActual = new Date().toTimeString().split(" ")[0]; // HH:MM:SS

        // Obtener todas las mesas para estadísticas globales
        const todasLasMesas = await Mesa.findAll();

        // Calcular estado de ocupación para cada mesa
        const mesasConOcupacion = await Promise.all(mesas.map(async (mesa) => {
            const mesaData = mesa.toJSON();

            // Buscar si hay reserva activa ahora mismo
            const reservaActiva = await Reserva.findOne({
                where: {
                    id_mesa: mesa.id,
                    fecha_reserva: hoy,
                    estado: {
                        [Op.in]: ["confirmada", "en_curso"]
                    },
                    hora_inicio: { [Op.lte]: horaActual },
                    hora_fin: { [Op.gte]: horaActual }
                }
            });

            // Buscar próxima reserva del día
            const proximaReserva = await Reserva.findOne({
                where: {
                    id_mesa: mesa.id,
                    fecha_reserva: hoy,
                    estado: {
                        [Op.in]: ["pendiente", "confirmada"]
                    },
                    hora_inicio: { [Op.gt]: horaActual }
                },
                order: [["hora_inicio", "ASC"]]
            });

            mesaData.ocupada = !!reservaActiva;
            mesaData.proximaReserva = proximaReserva ? {
                hora: proximaReserva.hora_inicio,
                estado: proximaReserva.estado
            } : null;

            return mesaData;
        }));

        // Estadísticas globales de ocupación
        let mesasOcupadasCount = 0;
        let mesasDisponiblesCount = 0;

        for (const mesa of todasLasMesas) {
            const reservaActiva = await Reserva.findOne({
                where: {
                    id_mesa: mesa.id,
                    fecha_reserva: hoy,
                    estado: { [Op.in]: ["confirmada", "en_curso"] },
                    hora_inicio: { [Op.lte]: horaActual },
                    hora_fin: { [Op.gte]: horaActual }
                }
            });

            if (reservaActiva) {
                mesasOcupadasCount++;
            } else if (mesa.estado === "activa") {
                mesasDisponiblesCount++;
            }
        }

        res.render("mesas/index", {
            csrfToken: req.csrfToken(),
            mesas: mesasConOcupacion,
            usuario: req.usuario,
            messages: req.flash(),
            currentPage: page,
            totalPages,
            totalMesas: count,
            mesasOcupadas: mesasOcupadasCount,
            mesasDisponibles: mesasDisponiblesCount,
            fechaActual: hoy,
            horaActual: horaActual.slice(0, 5)
        });

    } catch (error) {
        req.flash("error", "Error cargando mesas: " + error.message);
        res.redirect("/panel/admin");
    }
};

const mostrarCrearMesa = (req, res) => {
    res.render("mesas/form", {
        csrfToken: req.csrfToken(),
        mesa: null,
        usuario: req.usuario,
        action: "/mesas/crear",
        messages: req.flash()
    });
};

const crearMesa = async (req, res) => {
    try {
        const { nombre, capacidad, zona, estado } = req.body;
        await Mesa.create({
            nombre,
            capacidad: Number(capacidad),
            zona,
            estado: estado || "activa"
        });

        req.flash("exito", "Mesa creada correctamente");
        res.redirect("/mesas");
    } catch (error) {
        req.flash("error", "Error creando mesa: " + error.message);
        res.redirect("/mesas/crear");
    }
};

const mostrarEditarMesa = async (req, res) => {
    try {
        const mesa = await Mesa.findByPk(req.params.id);
        if (!mesa) {
            req.flash("error", "Mesa no encontrada");
            return res.redirect("/mesas");
        }
        res.render("mesas/form", {
            csrfToken: req.csrfToken(),
            mesa,
            usuario: req.usuario,
            action: `/mesas/${mesa.id}/editar`,
            messages: req.flash()
        });

    } catch (error) {
        req.flash("error", "Error cargando mesa: " + error.message);
        res.redirect("/mesas");
    }
};

const editarMesa = async (req, res) => {
    try {
        const { nombre, capacidad, zona, estado } = req.body;
        const mesa = await Mesa.findByPk(req.params.id);
        if (!mesa) {
            req.flash("error", "Mesa no encontrada");
            return res.redirect("/mesas");
        }
        await mesa.update({
            nombre,
            capacidad: Number(capacidad),
            zona,
            estado
        });

        req.flash("exito", "Mesa actualizada");
        res.redirect("/mesas");
    } catch (error) {
        req.flash("error", "Error actualizando mesa: " + error.message);
        res.redirect(`/mesas/${req.params.id}/editar`);
    }
};

const eliminarMesa = async (req, res) => {
    try {
        const mesa = await Mesa.findByPk(req.params.id);
        if (!mesa) {
            req.flash("error", "Mesa no encontrada");
            return res.redirect("/mesas");
        }

        // Evitar eliminar si tiene reservas futuras
        const hoy = new Date();
        const reservasFuturas = await Reserva.count({
            where: {
                id_mesa: mesa.id,
                fecha_reserva: { [Op.gte]: hoy.toISOString().split("T")[0] } // DATEONLY compare
            }
        });

        if (reservasFuturas > 0) {
            req.flash("error", "No se puede eliminar: la mesa tiene reservas futuras");
            return res.redirect("/mesas");
        }

        await mesa.destroy();
        req.flash("exito", "Mesa eliminada");
        res.redirect("/mesas");
    } catch (error) {
        req.flash("error", "Error eliminando mesa: " + error.message);
        res.redirect("/mesas");
    }
};

export {
    listarMesas,
    mostrarCrearMesa,
    crearMesa,
    mostrarEditarMesa,
    editarMesa,
    eliminarMesa
}