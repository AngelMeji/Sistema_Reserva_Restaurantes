import bcrypt from "bcrypt";

const usuario = [
  {
    nombre: "Admin",
    email: "admin@admin.com",
    password: bcrypt.hashSync("123456", 10),
    rol: "admin",
  },
  {
    nombre: "Recepcionista",
    email: "recepcionista@gmail.com",
    password: bcrypt.hashSync("123456", 10),
    rol: "recepcionista",
  },
];

export default usuario;
