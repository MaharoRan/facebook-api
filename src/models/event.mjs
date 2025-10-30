import mongoose from 'mongoose';

const Schema = new mongoose.Schema({
  nom: String,
  description: String,
  date_debut: Date,
  date_fin: Date,
  lieu: String,
  photo: String,
  public: Boolean,
  organisateurs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  groupe: { type: mongoose.Schema.Types.ObjectId, ref: 'Groupe' },
  discussion: { type: mongoose.Schema.Types.ObjectId, ref: 'Discussion' },
  albums: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Album' }],
  sondages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sondage' }],
  billetterie: { type: Boolean, default: false },
  typesBillets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TypeBillet' }]
}, {
  collection: 'events',
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
