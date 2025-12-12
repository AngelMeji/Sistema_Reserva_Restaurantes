import HorarioAtencion from "../models/HorarioAtencion.js";
import PoliticaReserva from "../models/PoliticaReserva.js";

const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const listarHorarios = async (req, res) => {
  try {
    const horarios = await HorarioAtencion.findAll({ order: [["dia_semana", "ASC"]] });
    let politica = await PoliticaReserva.findOne();

    if (!politica) {
      politica = await PoliticaReserva.create({});
    }

    res.render("config/config", {
      csrfToken: req.csrfToken(),
      horarios,
      politica,
      dias,
      usuario: req.usuario,
      messages: req.flash()

    });

  } catch (error) {
    req.flash("error", "Error cargando horarios: " + error.message);
    res.redirect("/panel/admin");
  }
};

const crearHorario = async (req, res) => {
  try {
    const { dia_semana, hora_apertura, hora_cierre } = req.body;

    if (hora_apertura >= hora_cierre) {
      req.flash("error", "Hora de apertura debe ser menor que hora de cierre");
      return res.redirect("/config");
    }

    await HorarioAtencion.create({
      dia_semana: Number(dia_semana),
      hora_apertura,
      hora_cierre,
      activo: true
    });

    req.flash("exito", "Horario creado");
    res.redirect("/config");

  } catch (error) {
    req.flash("error", "Error creando horario: " + error.message);
    res.redirect("/config");
  }
};

const editarHorario = async (req, res) => {
  try {
    const horario = await HorarioAtencion.findByPk(req.params.id);
    if (!horario) {
      req.flash("error", "Horario no encontrado");
      return res.redirect("/config");
    }

    const { hora_apertura, hora_cierre, activo } = req.body

    if (hora_apertura >= hora_cierre) {
      req.flash("error", "Hora de apertura debe ser menor que hora de cierre");
      return res.redirect("/config");
    }

    await horario.update({
      hora_apertura,
      hora_cierre,
      activo: !!activo
    });

    req.flash("exito", "Horario actualizado");
    res.redirect("/config");

  } catch (error) {
    req.flash("error", "Error editando horario: " + error.message);
    res.redirect("/config");
  }
};

const eliminarHorario = async (req, res) => {
  try {
    const horario = await HorarioAtencion.findByPk(req.params.id);
    if (!horario) {
      req.flash("error", "Horario no encontrado");
      return res.redirect("/config");
    }

    await horario.destroy();
    req.flash("exito", "Horario eliminado");
    res.redirect("/config");

  } catch (error) {
    req.flash("error", "Error eliminando horario: " + error.message);
    res.redirect("/config");
  }
};

const verPoliticas = async (req, res) => {
  try {
    let politica = await PoliticaReserva.findOne();
    if (!politica) politica = await PoliticaReserva.create({});
    res.render("config/politicas", {
      csrfToken: req.csrfToken(),
      politica,
      usuario: req.usuario,
      messages: req.flash()
    });

  } catch (error) {
    req.flash("error", "Error cargando políticas");
    res.redirect("/panel/admin");
  }
};

const actualizarPolitica = async (req, res) => {
  try {
    const { tiempo_cancelacion_min, tiempo_anticipacion_horas, max_personas_por_reserva, duracion_default_min } = req.body;
    let politica = await PoliticaReserva.findOne();

    if (!politica) {
      politica = await PoliticaReserva.create({});
    }

    await politica.update({
      tiempo_cancelacion_min: Number(tiempo_cancelacion_min),
      tiempo_anticipacion_horas: Number(tiempo_anticipacion_horas),
      max_personas_por_reserva: Number(max_personas_por_reserva),
      duracion_default_min: Number(duracion_default_min)
    });

    req.flash("exito", "Política actualizada");
    res.redirect("/config");

  } catch (error) {
    req.flash("error", "Error actualizando política: " + error.message);
    res.redirect("/config");
  }
};

export {
  listarHorarios,
  crearHorario,
  editarHorario,
  eliminarHorario,
  verPoliticas,
  actualizarPolitica,
};