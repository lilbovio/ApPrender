<div align="center">
  <img src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1200&auto=format&fit=crop" alt="Niños aprendiendo" width="100%" style="border-radius: 15px; margin-bottom: 20px;"/>

  # ✨ Chispapp: Aprendizaje Adaptativo para Niños ✨

  <p>Una plataforma educativa full-stack diseñada para estudiantes de primaria. Refuerza matemáticas e inglés adaptándose al estilo de aprendizaje de cada niño (Visual, Auditivo o Kinestésico).</p>

  <div>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Vite-B73BA5?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
    <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  </div>
</div>

---

## 🚀 Características Principales

*   🧠 **Test VAK Integrado:** Al registrarse, los niños realizan una pequeña evaluación para descubrir su modelo de aprendizaje predominante.
*   🎯 **Contenido Personalizado:** El sistema de Backend clasifica y envía lecciones adaptadas (con imágenes, audios o juegos) dependiendo de si el alumno es Visual, Auditivo o Kinestésico.
*   🎮 **Gamificación:** Sistema de XP (Puntos de Experiencia), rachas diarias y progreso en tiempo real para mantener a los niños motivados.
*   🔒 **Seguridad y Autenticación:** Cuentas protegidas con JSON Web Tokens (JWT) y contraseñas encriptadas con Bcrypt.

## 📁 Estructura del Proyecto

El repositorio está dividido en dos partes principales:

*   `/client` - Frontend desarrollado en **React** y **Vite**, usando CSS Modules y diseño Mobile-First con interfaces coloridas para niños.
*   `/server` - Backend RESTful API desarrollado en **Node.js** y **Express** con base de datos NoSQL en **MongoDB**.

## 🛠️ Requisitos Previos

Antes de comenzar, asegúrate de tener instalado en tu máquina:
- [Node.js](https://nodejs.org/es/) (v16 o superior)
- [MongoDB](https://www.mongodb.com/) (Local o una cuenta en MongoDB Atlas)

## 💻 Instalación y Ejecución Local

Sigue estos pasos para correr el proyecto en tu computadora:

### 1. Clonar el repositorio
```bash
git clone <url-de-tu-repositorio>
cd math-english-kids
```

### 2. Configurar el Backend (Servidor)
```bash
cd server
npm install
```
Crea un archivo llamado `.env` en la carpeta `server` y añade tus variables de entorno:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/edukids  # Cambia por tu URI de Mongo Atlas si es necesario
JWT_SECRET=tu_secreto_super_seguro
CLIENT_URL=http://localhost:5173
```
Poblar la base de datos con las lecciones por defecto y encender el servidor:
```bash
npm run seed     # (Opcional) Rellena la BD con contenido inicial
npm run dev      # Inicia el servidor de Node en modo desarrollo
```

### 3. Configurar el Frontend (Cliente)
En una nueva ventana de la terminal, entra a la carpeta del cliente:
```bash
cd client
npm install
npm run dev
```

La aplicación web estará disponible en [http://localhost:5173](http://localhost:5173).

---
<div align="center">
  <i>Desarrollado con ❤️ para transformar la educación primaria.</i>
</div>
