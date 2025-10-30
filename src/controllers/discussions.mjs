import DiscussionModel from '../models/discussion.mjs';
import MessageModel from '../models/message.mjs';

const Discussions = class Discussions {
  constructor(app, connect) {
    this.app = app;
    this.DiscussionModel = connect.model('Discussion', DiscussionModel);
    this.MessageModel = connect.model('Message', MessageModel);

    this.run();
  }

  // Créer une discussion pour un groupe
  createForGroupe() {
    this.app.post('/groupe/:groupeId/discussion', async (req, res) => {
      try {
        const discussion = new this.DiscussionModel({
          groupe: req.params.groupeId
        });

        const savedDiscussion = await discussion.save();
        res.status(201).json(savedDiscussion);
      } catch (err) {
        console.error(`[ERROR] discussion/create -> ${err.message || err}`);

        res.status(500).json({
          code: 500,
          message: 'Internal Server error',
          error: err.message
        });
      }
    });
  }

  // Créer une discussion pour un événement
  createForEvent() {
    this.app.post('/event/:eventId/discussion', async (req, res) => {
      try {
        const discussion = new this.DiscussionModel({
          event: req.params.eventId
        });

        const savedDiscussion = await discussion.save();
        res.status(201).json(savedDiscussion);
      } catch (err) {
        console.error(`[ERROR] discussion/create -> ${err.message || err}`);

        res.status(500).json({
          code: 500,
          message: 'Internal Server error',
          error: err.message
        });
      }
    });
  }

  // Récupérer une discussion
  getById() {
    this.app.get('/discussion/:id', async (req, res) => {
      try {
        const discussion = await this.DiscussionModel.findById(req.params.id)
          .populate({
            path: 'messages',
            populate: { path: 'auteur' }
          })
          .populate('groupe')
          .populate('event');

        if (!discussion) {
          res.status(404).json({
            code: 404,
            message: 'Discussion not found'
          });
          return;
        }

        res.status(200).json(discussion);
      } catch (err) {
        console.error(`[ERROR] discussion/:id -> ${err.message || err}`);

        res.status(500).json({
          code: 500,
          message: 'Internal Server error',
          error: err.message
        });
      }
    });
  }

  // Ajouter un message à une discussion
  addMessage() {
    this.app.post('/discussion/:id/message', async (req, res) => {
      try {
        const message = new this.MessageModel({
          ...req.body,
          discussion: req.params.id
        });

        const savedMessage = await message.save();

        // Ajouter le message à la discussion
        await this.DiscussionModel.findByIdAndUpdate(
          req.params.id,
          { $push: { messages: savedMessage._id } }
        );

        // Si c'est une réponse, ajouter au message parent
        if (req.body.messageParent) {
          await this.MessageModel.findByIdAndUpdate(
            req.body.messageParent,
            { $push: { reponses: savedMessage._id } }
          );
        }

        const populatedMessage = await this.MessageModel.findById(savedMessage._id)
          .populate('auteur');

        res.status(201).json(populatedMessage);
      } catch (err) {
        console.error(`[ERROR] discussion/:id/message -> ${err.message || err}`);

        res.status(500).json({
          code: 500,
          message: 'Internal Server error',
          error: err.message
        });
      }
    });
  }

  run() {
    this.createForGroupe();
    this.createForEvent();
    this.getById();
    this.addMessage();
  }
};

export default Discussions;
