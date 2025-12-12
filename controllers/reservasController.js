import { validationResult } from "express-validator";
import { Usuario, Reserva, Mesa, HorarioAtencion, PoliticaReserva } from "../models/index.js";
import { Op } from "sequelize";

// Helper para obtener horarios JSON
const obtenerHorariosJSON = async () => {
    try {
        const horarios = await HorarioAtencion.findAll({
            where: { activo: true },
            order: [["dia_semana", "ASC"]]
        });
        return JSON.stringify(horarios.map(h => ({
            dia_semana: h.dia_semana,
            hora_apertura: h.hora_apertura,
            hora_cierre: h.hora_cierre
        })));
    } catch (error) {
        console.error("Error obteniendo horarios:", error);
        return "[]";
    }
};

// Helper para obtener políticas
const obtenerPoliticas = async () => {
    try {
        let politica = await PoliticaReserva.findOne();
        if (!politica) {
            politica = await PoliticaReserva.create({});
        }
        return {
            tiempo_cancelacion_min: politica.tiempo_cancelacion_min,
            tiempo_anticipacion_horas: politica.tiempo_anticipacion_horas,
            max_personas_por_reserva: politica.max_personas_por_reserva,
            duracion_default_min: politica.duracion_default_min
        };
    } catch (error) {
        console.error("Error obteniendo políticas:", error);
        return {
            tiempo_cancelacion_min: 60,
            tiempo_anticipacion_horas: 1,
            max_personas_por_reserva: 8,
            duracion_default_min: 90
        };
    }
};

const mostrarFormulario = async (req, res) => {
    const horarios = await obtenerHorariosJSON();
    const politicas = await obtenerPoliticas();
    res.render("reservas", {
        title: "Hacer Reserva",
        csrfToken: req.csrfToken(),
        usuario: req.usuario,
        pagina: "Reservas",
        horarios,
        politicas: JSON.stringify(politicas)
    });
};

/**
 * Busca una mesa disponible para la fecha, hora y número de personas especificados
 * @param {string} fecha_reserva - Fecha de la reserva (YYYY-MM-DD)
 * @param {string} hora_inicio - Hora de inicio de la reserva (HH:MM)
 * @param {number} numero_personas - Número de personas para la reserva
 * @returns {Object} - { mesa: Mesa|null, error: string|null, tipoError: string|null }
 */
const buscarMesaDisponible = async (fecha_reserva, hora_inicio, numero_personas) => {
    // 1. Verificar si existen mesas en el sistema
    const totalMesas = await Mesa.count();

    if (totalMesas === 0) {
        return {
            mesa: null,
            error: "Aún no hay mesas disponibles para reservas. Por favor, contacte con el restaurante.",
            tipoError: "sin_mesas"
        };
    }

    // 2. Buscar mesas activas con capacidad suficiente
    const mesasConCapacidad = await Mesa.findAll({
        where: {
            estado: "activa",
            capacidad: {
                [Op.gte]: numero_personas
            }
        },
        order: [
            ["capacidad", "ASC"], // Preferir mesas con capacidad más ajustada
            ["id", "ASC"]
        ]
    });

    if (mesasConCapacidad.length === 0) {
        return {
            mesa: null,
            error: "No hay mesas que tengan esa capacidad",
            tipoError: "sin_capacidad"
        };
    }

    // 3. Calcular hora de fin estimada (90 minutos después - igual que en el hook del modelo)
    const [h, m] = hora_inicio.split(":").map(Number);
    const inicioDate = new Date();
    inicioDate.setHours(h, m, 0, 0);

    const finDate = new Date(inicioDate);
    finDate.setMinutes(finDate.getMinutes() + 90);

    const hora_fin_estimada = `${finDate.getHours().toString().padStart(2, "0")}:${finDate.getMinutes().toString().padStart(2, "0")}:00`;
    const hora_inicio_formatted = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:00`;

    // 4. Para cada mesa con capacidad, verificar si está disponible en el horario
    for (const mesa of mesasConCapacidad) {
        // Buscar reservas que se solapan con el horario solicitado
        const reservasConflictivas = await Reserva.count({
            where: {
                id_mesa: mesa.id,
                fecha_reserva: fecha_reserva,
                estado: {
                    [Op.notIn]: ["cancelada", "completada", "no_show"] // Solo considerar reservas activas
                },
                // Verificar solapamiento de horarios:
                // La nueva reserva se solapa si:
                // (hora_inicio_nueva < hora_fin_existente) AND (hora_fin_nueva > hora_inicio_existente)
                [Op.and]: [
                    {
                        hora_inicio: {
                            [Op.lt]: hora_fin_estimada
                        }
                    },
                    {
                        hora_fin: {
                            [Op.gt]: hora_inicio_formatted
                        }
                    }
                ]
            }
        });

        // Si no hay conflictos, esta mesa está disponible
        if (reservasConflictivas === 0) {
            return {
                mesa: mesa,
                error: null,
                tipoError: null
            };
        }
    }

    // 5. Si llegamos aquí, todas las mesas están ocupadas
    return {
        mesa: null,
        error: `Todas las mesas están reservadas para el ${fecha_reserva} a las ${hora_inicio}. Por favor, seleccione otro horario o fecha.`,
        tipoError: "todas_ocupadas"
    };
};

const crearReserva = async (req, res) => {
    // Obtener horarios y políticas para todos los renders
    const horarios = await obtenerHorariosJSON();
    const politicas = JSON.stringify(await obtenerPoliticas());

    // Validación
    let resultado = validationResult(req);

    if (!resultado.isEmpty()) {
        return res.status(400).render("reservas", {
            title: "Hacer Reserva",
            errores: resultado.array(),
            usuario: req.usuario,
            csrfToken: req.csrfToken(),
            datos: req.body,
            pagina: "Reservas",
            horarios,
            politicas
        });
    }

    try {
        const {
            nombre,
            email,
            telefono,
            fecha_reserva,
            hora_inicio,
            numero_personas,
            observaciones,
            canal,
            dispositivo,
        } = req.body;

        const usuarioReserva = req.usuario;
        if (!usuarioReserva) {
            return res.status(403).render("reservas", {
                title: "Hacer Reserva",
                errores: [{ msg: "Debes iniciar sesión para hacer una reserva" }],
                csrfToken: req.csrfToken(),
                pagina: "Reservas",
                horarios,
                politicas
            });
        }

        // Buscar mesa disponible automáticamente
        const { mesa, error, tipoError } = await buscarMesaDisponible(
            fecha_reserva,
            hora_inicio,
            parseInt(numero_personas)
        );

        // Si hay error (no hay mesas disponibles), mostrar mensaje al usuario
        if (error) {
            console.log(`No se pudo asignar mesa: ${tipoError} - ${error}`);
            return res.status(400).render("reservas", {
                title: "Hacer Reserva",
                errores: [{ msg: error }],
                usuario: req.usuario,
                csrfToken: req.csrfToken(),
                datos: req.body,
                pagina: "Reservas",
                horarios,
                politicas
            });
        }

        //si recepcionista hace la reserva el estado se pondra automaticamente en confirmado
        const estadoFinal = usuarioReserva.rol === "cliente" ? "pendiente" : "confirmada";

        // Crear la reserva con la mesa asignada
        const nuevaReserva = await Reserva.create({
            id_usuario: usuarioReserva.id,
            id_mesa: mesa.id, // Asignar la mesa encontrada
            fecha_reserva,
            hora_inicio,
            hora_fin: null,
            numero_personas,
            estado: estadoFinal,
            canal: canal || "web",
            observaciones: observaciones || null, // Guardar solo lo que escribió el usuario
            creado_por: usuarioReserva.id,
            dispositivo: dispositivo || "desktop",
        });

        // Verificar que la reserva se creó correctamente
        const reservaCreada = await Reserva.findByPk(nuevaReserva.id_reserva);

        if (reservaCreada) {
            console.log(`Reserva #${reservaCreada.id_reserva} creada con mesa ${mesa.nombre} (ID: ${mesa.id})`);
            // Redirigir a la página de inicio con mensaje de éxito
            return res.redirect(`/?reserva=${reservaCreada.id_reserva}&mensaje=exito&mesa=${mesa.nombre}`);
        } else {
            throw new Error("No se pudo verificar la creación de la reserva");
        }

    } catch (error) {
        console.error("Error creando reserva:", error);

        return res.status(500).render("reservas", {
            title: "Hacer Reserva",
            errores: [{ msg: "No se pudo crear la reserva. Por favor inténtelo nuevamente." }],
            usuario: req.usuario,
            csrfToken: req.csrfToken(),
            pagina: "Reservas",
            horarios,
            politicas
        });
    }
};

export {
    mostrarFormulario,
    crearReserva
};