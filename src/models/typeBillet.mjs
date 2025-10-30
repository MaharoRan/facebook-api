import mongoose from 'mongoose';

const Schema = new mongoose.Schema({
  nom: { type: String, required: true },
  montant: { type: Number, required: true },
  quantiteLimitee: { type: Number, required: true },
  quantiteVendue: { type: Number, default: 0 },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true }
}, {
  collection: 'typesBillets',
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
