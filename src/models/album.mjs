import mongoose from 'mongoose';

const Schema = new mongoose.Schema({
  title: String,
  description: String,
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  photos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Photo' }],
  created_at: { type: Date, default: Date.now }
}, {
  collection: 'albums',
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
