import mongoose from 'mongoose';

const Schema = new mongoose.Schema({
  nom_utilisateur: String,
  mail: { type: String, unique: true, required: true },
  age: Number,
  sexe: String,
  ville: String,
  groupes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Groupe' }]
}, {
  collection: 'users',
  minimize: false,
  versionKey: false
}).set('toJSON', {
  transform: (doc, ret) => {
    const retUpdated = ret;
    retUpdated.id = ret._id;

    delete retUpdated._id;

    return retUpdated;
  }
});

export default Schema;
