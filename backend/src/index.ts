import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import errorHandler from './middlewares/errorHandler';
import usersRouter from './routes/users';
import transfersRouter from './routes/transfers';
import sequelize from './database';
import './models/index';
import verifyHmac from './middlewares/hmac';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use(verifyHmac);
app.use('/api/users', usersRouter)
app.use('/api/transfers', transfersRouter)

app.use(errorHandler)

const start = async (): Promise<void> => {
  try {
    await sequelize.authenticate()
    console.log('Conexión a la base de datos exitosa.')
    await sequelize.sync({ alter: true })
    console.log('Tablas sincronizadas.')
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (err) {
    console.error('Error al conectar la base de datos:', err)
    process.exit(1)
  }
}

start()
