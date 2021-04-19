import * as mongoose from 'mongoose';

export const JogadorSchema = new mongoose.Schema({
  telefoneCelular: {
    type: String,
  },
  email: {
    type: String,
    unique: true
  },
  nome: String,
  ranking: String,
  possicaoRanking: Number,
  urlFotoJogador: String
}, {
  timestamps: true,
  collection: 'Jogador'
})