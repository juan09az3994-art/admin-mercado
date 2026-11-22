const jwt = require("jsonwebtoken");
const SECRET = require("../config/jwt");

// Revisa el token que manda el frontend en el encabezado Authorization.
// Acepta "Bearer <token>" o el token solo. Si es válido deja los datos
// del usuario (id y rol) en req.user para las siguientes funciones.
const verifyToken = (req, res, next) => {
    const encabezado = req.headers["authorization"] || "";
    const token = encabezado.startsWith("Bearer ") ? encabezado.slice(7) : encabezado;

    if (!token) {
        return res.status(401).json({ message: "Token requerido" });
    }

    try {
        req.user = jwt.verify(token, SECRET);
        next();
    } catch (error) {
        return res.status(401).json({ message: "Token inválido o vencido" });
    }
};

// Deja pasar solo a los roles indicados. Va después de verifyToken.
const soloRol = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.rol)) {
        return res.status(403).json({ message: "No tienes permiso para esta acción" });
    }
    next();
};

// Las peticiones GET pasan con cualquier rol; las que modifican datos solo con los roles indicados.
const soloRolSiModifica = (...roles) => (req, res, next) => {
    if (req.method === "GET") return next();
    return soloRol(...roles)(req, res, next);
};

module.exports = verifyToken;
module.exports.verifyToken = verifyToken;
module.exports.soloRol = soloRol;
module.exports.soloRolSiModifica = soloRolSiModifica;
