import mongoose from 'mongoose';

const Schema = new mongoose.Schema({
  texte: { type: String, required: true },
  sondage: { type: mongoose.Schema.Types.ObjectId, ref: 'Sondage', required: true },
  reponsesPossibles: [{
    texte: { type: String, required: true }
  }]
}, {
  collection: 'questions',
  minimize: false,
  versionKey: false
}).set('toJSON', {
  transform: (doc, ret) => {
    const retUpdated = ret;
    retUpdated.id = ret._id;

    return retUpdated;
  }
});

export default Schema;
