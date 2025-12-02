import express from "express";
import csurf from "csurf";
import cookieParser from "cookie-parser";
import db from "./config/db.js";

// Variable to track DB connection status
let isDbConnected = false;

// Crear APP
const app = express();

// Habilitar lectura de los forms
app.use(express.urlencoded({ extended: true }));

// Habilitar el Cookie Parser
app.use(cookieParser());

// Habiliar el CSRF
app.use(csurf({ cookie: true }));

// Conexion a la DB
try {
  await db.authenticate();
  db.sync();
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

// Routing
app.get("/auth/login", (req, res) => {
  res.render("auth/login", { pagina: "Iniciar Sesión" });
});

app.get("/auth/registro", (req, res) => {
  res.render("auth/registro", { pagina: "Crear Cuenta" });
});

// Routing - Demo route
app.get("/", (req, res) => {
  res.render("index", { title: "Inicio", dbStatus: isDbConnected, pagina: "Inicio" });
});

// Definir el puerto
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("El servidor esta corriendo en el puerto: " + port);
});
