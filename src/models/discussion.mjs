import mongoose from 'mongoose';

const Schema = new mongoose.Schema({
  groupe: { type: mongoose.Schema.Types.ObjectId, ref: 'Groupe' },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }]
}, {
  collection: 'discussions',
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

// Validation: un fil de discussion doit être lié à un groupe OU un événement, pas les deux
Schema.pre('save', function validateDiscussion(next) {
  if ((this.groupe && this.event) || (!this.groupe && !this.event)) {
    next(new Error('Discussion must be linked to either a group OR an event, not both'));
  } else {
    next();
  }
});

export default Schema;
