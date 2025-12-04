import Usuario from "./Usuarios.js";
import Cliente from "./Clientes.js";
import Mesa from "./Mesas.js";
import Reserva from "./Reservas.js";
import ConfiguracionRestaurante from "./ConfiguracionRestaurante.js";
import HorarioAtencion from "./HorarioAtencion.js";

// Cliente -> Reservas
Reserva.belongsTo(Usuario, { foreignKey: "id_usuario" });
Usuario.hasMany(Reserva, { foreignKey: "id_usuario" });

// Mesa -> Reservas (opcional)
Reserva.belongsTo(Mesa, { foreignKey: "id_mesa" });
Mesa.hasMany(Reserva, { foreignKey: "id_mesa" });

// Usuario -> Reservas creadas
Reserva.belongsTo(Usuario, { foreignKey: "creado_por" });
Usuario.hasMany(Reserva, { foreignKey: "creado_por" });

export { Cliente, Mesa, Usuario, Reserva, ConfiguracionRestaurante, HorarioAtencion };