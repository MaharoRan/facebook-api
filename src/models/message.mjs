import mongoose from 'mongoose';

const Schema = new mongoose.Schema({
  contenu: { type: String, required: true },
  auteur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  discussion: { type: mongoose.Schema.Types.ObjectId, ref: 'Discussion', required: true },
  messageParent: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  dateCreation: { type: Date, default: Date.now },
  reponses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }]
}, {
  collection: 'messages',
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
