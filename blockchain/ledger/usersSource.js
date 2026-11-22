// usersSource.js - Lectura de la colección `users` de ApPrender para la verificación.
//
// Usa el driver nativo a través de la conexión de Mongoose, por lo que NO se importa
// el modelo de servidor (y sus hooks de bcrypt no se ejecutan). Solo se usa `find`:
// este módulo nunca escribe en la base de datos.

import mongoose from 'mongoose';

// Devuelve un origen de usuarios con el método listUsers(), que lee TODOS los documentos
// de `users` y los devuelve como objetos planos con solo los campos que usa el ledger.
// `driver` permite inyectar un falso en las pruebas. No conecta por sí mismo: la conexión
// la abre connectDB antes de llamar a listUsers.
export function mongoUsersSource(driver = mongoose) {
  return {
    async listUsers() {
      const docs = await driver.connection.collection('users').find({}).toArray();
      return docs.map((doc) => ({
        _id: doc._id,
        name: doc.name,
        email: doc.email,
        avatar: doc.avatar,
        vakType: doc.vakType,
        password: doc.password,
      }));
    },
  };
}
