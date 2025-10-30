import mongoose from 'mongoose';

const Schema = new mongoose.Schema({
  nom: String,
  description: String,
  icone: String,
  photo: String,
  type: { type: String, enum: ['public', 'prive', 'secret'], default: 'public' },
  publication: { type: Boolean },
  creation: { type: Boolean },
  membres: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  discussion: { type: mongoose.Schema.Types.ObjectId, ref: 'Discussion' }
}, {
  collection: 'groupes',
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
