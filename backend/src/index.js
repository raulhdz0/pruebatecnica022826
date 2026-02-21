require("dotenv").config();
const express = require("express");
const cors = require("cors");
const errorHandler = require("./middlewares/errorHandler");
const usersRouter = require("./routes/users");
const transfersRouter = require("./routes/transfers");
const sequelize = require("./database");
require("./models/index");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/users", usersRouter);
app.use("/api/transfers", transfersRouter);

app.use(errorHandler);

const start = async () => {
    try {
        await sequelize.authenticate();
        console.log("Conexión a la base de datos exitosa.");
        await sequelize.sync({ alter: true });
        console.log("Tablas sincronizadas.");
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error("Error al conectar la base de datos:", err);
        process.exit(1);
    };
};

start();
