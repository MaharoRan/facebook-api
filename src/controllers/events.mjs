import EventModel from '../models/event.mjs';
import GroupeModel from '../models/groupe.mjs';

const Events = class Events {
  constructor(app, connect) {
    this.app = app;
    this.EventModel = connect.model('Event', EventModel);
    this.GroupeModel = connect.model('Groupe', GroupeModel);

    this.run();
  }

  deleteById() {
    this.app.delete('/groupe/:groupeId/event/:id', async (req, res) => {
      try {
        // Remove the event
        const deletedEvent = await this.EventModel.findByIdAndDelete(req.params.id);

        if (deletedEvent) {
          // Remove the event reference from the group
          await this.GroupeModel.findByIdAndUpdate(
            req.params.groupeId,
            { $pull: { events: deletedEvent._id } },
            { new: true }
          );

          res.status(200).json(deletedEvent);
          return;
        }

        res.status(404).json({
          code: 404,
          message: 'Event not found'
        });
      } catch (err) {
        console.error(`[ERROR] event/:id -> ${err.message || err}`);

        res.status(500).json({
          code: 500,
          message: 'Internal Server error',
          error: err.message
        });
      }
    });
  }

  showById() {
    this.app.get('/groupe/:groupeId/event/:id', (req, res) => {
      try {
        this.EventModel.findById(req.params.id)
          .populate('organisateurs')
          .populate('participants')
          .populate('groupe')
          .then((event) => {
            res.status(200).json(event || {});
          })
          .catch(() => {
            res.status(500).json({
              code: 500,
              message: 'Internal Server error'
            });
          });
      } catch (err) {
        console.error(`[ERROR] event/:id -> ${err}`);

        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  showAllEvents() {
    this.app.get('/events', (req, res) => {
      try {
        this.EventModel.find()
          .populate('organisateurs')
          .populate('participants')
          .populate('groupe')
          .then((events) => {
            res.status(200).json(events || []);
          })
          .catch(() => {
            res.status(500).json({
              code: 500,
              message: 'Internal Server error'
            });
          });
      } catch (err) {
        console.error(`[ERROR] events -> ${err}`);

        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  showEventsByGroupe() {
    this.app.get('/groupe/:groupeId/events', (req, res) => {
      try {
        this.EventModel.find({ groupe: req.params.groupeId })
          .populate('organisateurs')
          .populate('participants')
          .populate('groupe')
          .then((events) => {
            res.status(200).json(events || []);
          })
          .catch(() => {
            res.status(500).json({
              code: 500,
              message: 'Internal Server error'
            });
          });
      } catch (err) {
        console.error(`[ERROR] groupe/:groupeId/events -> ${err}`);

        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  addParticipant() {
    this.app.post('/event/:id/participant/:userId', (req, res) => {
      try {
        this.EventModel.findByIdAndUpdate(
          req.params.id,
          { $addToSet: { participants: req.params.userId } },
          { new: true }
        )
          .populate('organisateurs')
          .populate('participants')
          .then((event) => {
            res.status(200).json(event || {});
          })
          .catch(() => {
            res.status(500).json({
              code: 500,
              message: 'Internal Server error'
            });
          });
      } catch (err) {
        console.error(`[ERROR] event/:id/participant/:userId -> ${err}`);

        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  removeParticipant() {
    this.app.delete('/event/:id/participant/:userId', (req, res) => {
      try {
        this.EventModel.findByIdAndUpdate(
          req.params.id,
          { $pull: { participants: req.params.userId } },
          { new: true }
        )
          .populate('organisateurs')
          .populate('participants')
          .then((event) => {
            res.status(200).json(event || {});
          })
          .catch(() => {
            res.status(500).json({
              code: 500,
              message: 'Internal Server error'
            });
          });
      } catch (err) {
        console.error(`[ERROR] event/:id/participant/:userId -> ${err}`);

        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  create() {
    this.app.post('/groupe/:groupeId/event/', (req, res) => {
      try {
        const eventModel = new this.EventModel(req.body);
        eventModel.groupe = req.params.groupeId;

        eventModel.save().then((event) => {
          res.status(201).json(event || {});
        }).catch(() => {
          res.status(500).json({
            code: 500,
            message: 'Internal Server error'
          });
        });
      } catch (err) {
        console.error(`[ERROR] event/create -> ${err}`);

        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  update() {
    this.app.put('/groupe/:groupeId/event/:id', async (req, res) => {
      try {
        // Update the event
        const updatedEvent = await this.EventModel.findByIdAndUpdate(
          req.params.id,
          { ...req.body, groupe: req.params.groupeId },
          { new: true }
        )
          .populate('organisateurs')
          .populate('participants')
          .populate('groupe');

        res.status(200).json(updatedEvent || {});
      } catch (err) {
        console.error(`[ERROR] event/update -> ${err}`);

        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  run() {
    this.create();
    this.showAllEvents();
    this.showEventsByGroupe();
    this.showById();
    this.update();
    this.addParticipant();
    this.removeParticipant();
    this.deleteById();
  }
};

export default Events;
