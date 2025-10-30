import mongoose from 'mongoose';

const Schema = new mongoose.Schema({
  title: String,
  url: String,
  description: String,
  created_at: Date,
  album: { type: mongoose.Schema.Types.ObjectId, ref: 'Album' },
  auteur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  commentaires: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Commentaire' }]
}, {
  collection: 'photos',
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
