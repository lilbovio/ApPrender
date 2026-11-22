// connect.js - Conexión a MongoDB Atlas para los scripts del ledger.
//
// La URI se lee SOLO de la variable de entorno MONGO_URI (los scripts se lanzan con
// `node --env-file=../server/.env ...`). Ninguna función de este archivo imprime la URI
// ni incluye partes de ella en los mensajes de error: los fallos de conexión se
// reemplazan por un mensaje genérico con el nombre del error.

import mongoose from 'mongoose';

const SERVER_SELECTION_TIMEOUT_MS = 8000;

const CONNECT_ERROR_MESSAGE =
  'No se pudo conectar a MongoDB (revisa MONGO_URI y la lista de acceso de red de Atlas)';

// Solo se admiten nombres sencillos de base de datos; cualquier otra cosa se descarta
// para que nunca se muestre texto inesperado (podría ser parte de una contraseña mal parseada).
const SAFE_DB_NAME = /^[A-Za-z0-9_-]+$/;

// Conecta a Atlas usando MONGO_URI. `driver` permite inyectar un falso en las pruebas.
export async function connectDB(driver = mongoose) {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('Falta la variable de entorno MONGO_URI');
  }

  try {
    await driver.connect(uri, { serverSelectionTimeoutMS: SERVER_SELECTION_TIMEOUT_MS });
  } catch (err) {
    // Se descarta el mensaje original: puede contener la URI completa.
    throw new Error(`${CONNECT_ERROR_MESSAGE}: ${err?.name ?? 'Error'}`);
  }

  return driver;
}

// Cierra la conexión abierta. Tampoco expone detalles del error original.
export async function disconnectDB(driver = mongoose) {
  try {
    await driver.disconnect();
  } catch (err) {
    throw new Error(`No se pudo cerrar la conexión con MongoDB: ${err?.name ?? 'Error'}`);
  }
}

// Describe el destino de forma segura para logs: solo el nombre de la base de datos.
// Nunca devuelve usuario, contraseña ni host.
export function describeTarget(uri) {
  let url;
  try {
    url = new URL(uri);
  } catch {
    return 'base de datos: desconocida (URI no válida)';
  }

  const name = url.pathname.replace(/^\/+/, '');
  if (!name) {
    return 'base de datos: (no especificada en la URI)';
  }
  if (!SAFE_DB_NAME.test(name)) {
    return 'base de datos: (nombre no reconocido)';
  }
  return `base de datos: ${name}`;
}
