// LedgerBlock.js - Modelo Mongoose de un bloque del ledger de usuarios.
//
// Importar este archivo NO abre ninguna conexión a la base de datos: solo registra
// el esquema. La conexión la gestiona quien use el modelo (servidor o scripts).

import mongoose from 'mongoose';

const ledgerBlockSchema = new mongoose.Schema(
  {
    // 0 = génesis. Índice único: dos bloques con el mismo número no pueden coexistir,
    // así que una escritura concurrente que pierda la carrera falla y se reintenta.
    index: { type: Number, required: true, unique: true },

    // Texto ISO-8601 UTC. Se guarda como String para que el hash sea reproducible
    // (un Date de Mongo podría volver con otra precisión o zona).
    timestamp: { type: String, required: true },

    // Evento registrado: { event, userId, fingerprint }.
    data: { type: Object, required: true },

    prev_hash: { type: String, required: true, minlength: 64, maxlength: 64 },

    hash: { type: String, required: true, unique: true, minlength: 64, maxlength: 64 },
  },
  {
    collection: 'ledgerblocks',
    // El timestamp forma parte del hash: no debe ser gestionado por Mongoose.
    timestamps: false,
  }
);

const LedgerBlock = mongoose.models.LedgerBlock || mongoose.model('LedgerBlock', ledgerBlockSchema);

export default LedgerBlock;
