# Mini Wallet

Aplicación full stack que simula una wallet interna básica con transferencias entre usuarios.

**Stack:** React + Vite + Node.js + Express + Sequelize + PostgreSQL

---

## Requisitos previos

- Node.js >= 18
- PostgreSQL >= 14
- npm >= 9

---

## Configuración de base de datos

Conectar a PostgreSQL y crer la base de datos:
```bash
psql -U postgres
```
```sql
CREATE DATABASE mini_wallet;
\q
```

> No se requieren migraciones manuales. Al iniciar el backend, Sequelize crea las tablas automáticamente.

---

## Configuración del backend
```bash
cd backend
npm install
cp .env.example .env
```

Editar el `.env` con credenciales correctas:
```
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mini_wallet
DB_USER=postgres
DB_PASSWORD=tu_password
```

Ejecución de servidor:
```bash
npm run dev
```

Si los pasos previos fueron correcto, debería verse algo así:
```
Conexión a la base de datos exitosa.
Tablas sincronizadas.
Server running on port 3000
```

---

## Configuración del frontend

En otra terminal:
```bash
cd frontend
npm install
cp .env.example .env
```

El `.env` del frontend ya viene configurado por defecto:
```
VITE_API_URL=http://localhost:3000/api
```
Sin embargo, como .env está incluido dentro de .gitignore se agrega .env.example para tener referencia.

Ejecución de frontend:
```bash
npm run dev
```

Abrir navegador en:
```
http://localhost:5173
```
---
