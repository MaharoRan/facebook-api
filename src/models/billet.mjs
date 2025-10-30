import mongoose from 'mongoose';

const Schema = new mongoose.Schema({
  typeBillet: { type: mongoose.Schema.Types.ObjectId, ref: 'TypeBillet', required: true },
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  adresse: {
    rue: String,
    ville: String,
    codePostal: String,
    pays: String
  },
  dateAchat: { type: Date, default: Date.now }
}, {
  collection: 'billets',
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
