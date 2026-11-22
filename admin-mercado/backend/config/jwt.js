// Clave con la que se firman los tokens de sesión. Se lee de la variable JWT_SECRET.
// Si la clave estuviera escrita en el código, cualquiera que lea el repositorio
// podría fabricar un token de administrador.
const SECRET = process.env.JWT_SECRET;

if (!SECRET) {
    throw new Error("Falta la variable JWT_SECRET. Cópiala de .env.example a tu archivo .env");
}

module.exports = SECRET;
