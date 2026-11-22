// dotenv va primero para que config/db.js ya encuentre las variables de .env
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./config/db");

const app = express();

//SOCKET
const http = require("http");
const { initSocket } = require("./socket");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Servidor funcionando");
});

// -------------------
//  PRUEBA MYSQL
app.get("/test-db", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT 1 + 1 AS result");
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// ---------------------


// rutas
// Públicas: login y registro. Todo lo demás pide token y el rol correcto.
const { verifyToken, soloRol, soloRolSiModifica } = require("./middleware/authMiddleware");
const soloAdmin = [verifyToken, soloRol("administrador")];
const soloLocatario = [verifyToken, soloRol("locatario")];

const authRoutes = require("./routes/auth");
app.use("/api", authRoutes);

const registroRoutes = require("./routes/registro");
app.use("/api/registro", registroRoutes);

const pagosRoutes = require("./routes/pagos");
app.use("/api/pagos", soloAdmin, pagosRoutes);

const usuariosRoutes = require("./routes/usuarios");
app.use("/api/usuarios", soloAdmin, usuariosRoutes);

const puestosRoutes = require("./routes/puestos");
app.use("/api/puestos", soloAdmin, puestosRoutes);


const incidenciasRoutes = require("./routes/incidencias");
app.use("/api/incidencias", soloAdmin, incidenciasRoutes);

const avisosRoutes = require("./routes/avisos");
// Los avisos los leen ambos roles, pero solo el administrador los publica, edita o archiva
app.use("/api/avisos", verifyToken, soloRolSiModifica("administrador"), avisosRoutes);

const administradoresRoutes = require("./routes/admin");
app.use("/api/administradores", soloAdmin, administradoresRoutes);

const locatarioRoutes = require("./routes/locatario");
app.use("/api/locatario", soloLocatario, locatarioRoutes);

const dashboardRoutes = require("./routes/dashboard");
app.use("/api/dashboard", soloAdmin, dashboardRoutes);

const smsRoutes = require("./routes/sms"); 
app.use("/api/pagos", soloAdmin, smsRoutes);

//--------------------

const server = http.createServer(app);
initSocket(server);
 
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
