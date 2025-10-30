import mongoose from 'mongoose';

const Schema = new mongoose.Schema({
  participant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  reponseChoisie: { type: Number, required: true },
  dateReponse: { type: Date, default: Date.now }
}, {
  collection: 'reponses',
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

// Validation: un participant ne peut répondre qu'une seule fois à une question
Schema.index({ participant: 1, question: 1 }, { unique: true });

export default Schema;
