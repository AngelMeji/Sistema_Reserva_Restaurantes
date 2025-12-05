import express from "express";
import csurf from "csurf";
import cookieParser from "cookie-parser";
import session from "express-session";
import flash from "connect-flash";
import db from "./config/db.js";
import usuarioRoutes from "./routes/usuariosRoutes.js";
import reservasRoutes from "./routes/reservasRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { identificarUsuario } from "./middleware/identificarUsuario.js";

// Variable to track DB connection status
let isDbConnected = false;

// Crear APP
const app = express();

// Habilitar lectura de los forms
app.use(express.urlencoded({ extended: true }));

// Habilitar el Cookie Parser
app.use(cookieParser());

// Configurar sesiones
app.use(session({
  secret: process.env.SECRET_KEY || 'mi_secreto_super_seguro',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // 24 horas
  }
}));

// Habilitar flash messages
app.use(flash());

// Middleware para pasar mensajes flash a las vistas
app.use((req, res, next) => {
  res.locals.mensajes = {
    error: req.flash('error'),
    exito: req.flash('exito')
  };
  next();
});

// Habiliar el CSRF
app.use(csurf({ cookie: true }));

// Conexion a la DB
try {
  await db.authenticate();
  await db.sync();
  console.log("La conexion es correcta a la DB");
  isDbConnected = true;
} catch (error) {
  console.error("No se puede conectar", error);
  isDbConnected = false;
}

// Habilitar Pug
app.set("view engine", "pug");
app.set("views", "./views");

// Definir la ruta Public
app.use(express.static("public"));

// Middleware para identificar usuario en todas las rutas
app.use(identificarUsuario);

// Routing
app.use("/auth", usuarioRoutes);
app.use("/reservas", reservasRoutes);
app.use("/", adminRoutes);

// Routing - Página principal
app.get("/", (req, res) => {
  // Obtener mensajes de éxito desde query params
  const { reserva, mensaje } = req.query;

  let mensajeExito = null;
  if (reserva && mensaje === 'exito') {
    mensajeExito = {
      tipo: 'exito',
      texto: `¡Tu reserva #${reserva} ha sido creada exitosamente! Te contactaremos pronto para confirmar.`
    };
  }

  res.render("index", {
    title: "Inicio",
    dbStatus: isDbConnected,
    pagina: "Inicio",
    usuario: req.usuario,
    mensajeExito
  });
});

// Definir el puerto
const port = process.env.PORT || 3000;

app.listen(port, '0.0.0.0', () => {
  console.log(`El servidor esta corriendo en el puerto: ${port}`);

  // Mostrar IP local para acceso desde otros dispositivos
  import('os').then(os => {
    const networkInterfaces = os.networkInterfaces();
    const ips = [];

    Object.keys(networkInterfaces).forEach((interfaceName) => {
      networkInterfaces[interfaceName].forEach((iface) => {
        if (iface.family === 'IPv4' && !iface.internal) {
          ips.push(iface.address);
        }
      });
    });

    if (ips.length > 0) {
      console.log('\nPara probar en tu teléfono, usa una de estas direcciones:');
      ips.forEach(ip => {
        console.log(`http://${ip}:${port}`);
      });
      console.log('\nAsegúrate de que tu teléfono y computadora estén en la misma red WiFi.');
    }
  });
});
