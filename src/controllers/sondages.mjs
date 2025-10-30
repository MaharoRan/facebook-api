import SondageModel from '../models/sondage.mjs';
import QuestionModel from '../models/question.mjs';
import ReponseModel from '../models/reponse.mjs';
import EventModel from '../models/event.mjs';

const Sondages = class Sondages {
  constructor(app, connect) {
    this.app = app;
    this.SondageModel = connect.model('Sondage', SondageModel);
    this.QuestionModel = connect.model('Question', QuestionModel);
    this.ReponseModel = connect.model('Reponse', ReponseModel);
    this.EventModel = connect.model('Event', EventModel);

    this.run();
  }

  // Créer un sondage pour un événement
  create() {
    this.app.post('/event/:eventId/sondage', async (req, res) => {
      try {
        const sondage = new this.SondageModel({
          ...req.body,
          event: req.params.eventId
        });

        const savedSondage = await sondage.save();

        // Ajouter le sondage à l'événement
        await this.EventModel.findByIdAndUpdate(
          req.params.eventId,
          { $push: { sondages: savedSondage._id } }
        );

        res.status(201).json(savedSondage);
      } catch (err) {
        console.error(`[ERROR] sondage/create -> ${err.message || err}`);

        res.status(500).json({
          code: 500,
          message: 'Internal Server error',
          error: err.message
        });
      }
    });
  }

  // Récupérer un sondage avec ses questions
  getById() {
    this.app.get('/sondage/:id', async (req, res) => {
      try {
        const sondage = await this.SondageModel.findById(req.params.id)
          .populate('questions')
          .populate('createur')
          .populate('event');

        if (!sondage) {
          res.status(404).json({
            code: 404,
            message: 'Poll not found'
          });
          return;
        }

        res.status(200).json(sondage);
      } catch (err) {
        console.error(`[ERROR] sondage/:id -> ${err.message || err}`);

        res.status(500).json({
          code: 500,
          message: 'Internal Server error',
          error: err.message
        });
      }
    });
  }

  // Récupérer les sondages d'un événement
  getByEvent() {
    this.app.get('/event/:eventId/sondages', async (req, res) => {
      try {
        const sondages = await this.SondageModel.find({
          event: req.params.eventId
        })
          .populate('questions')
          .populate('createur');

        res.status(200).json(sondages);
      } catch (err) {
        console.error(`[ERROR] sondages -> ${err.message || err}`);

        res.status(500).json({
          code: 500,
          message: 'Internal Server error',
          error: err.message
        });
      }
    });
  }

  // Ajouter une question à un sondage
  addQuestion() {
    this.app.post('/sondage/:id/question', async (req, res) => {
      try {
        const question = new this.QuestionModel({
          ...req.body,
          sondage: req.params.id
        });

        const savedQuestion = await question.save();

        // Ajouter la question au sondage
        await this.SondageModel.findByIdAndUpdate(
          req.params.id,
          { $push: { questions: savedQuestion._id } }
        );

        res.status(201).json(savedQuestion);
      } catch (err) {
        console.error(`[ERROR] question/create -> ${err.message || err}`);

        res.status(500).json({
          code: 500,
          message: 'Internal Server error',
          error: err.message
        });
      }
    });
  }

  // Répondre à une question
  answerQuestion() {
    this.app.post('/question/:questionId/reponse', async (req, res) => {
      try {
        const reponse = new this.ReponseModel({
          question: req.params.questionId,
          participant: req.body.participant,
          reponseChoisie: req.body.reponseChoisie
        });

        const savedReponse = await reponse.save();

        res.status(201).json(savedReponse);
      } catch (err) {
        if (err.code === 11000) {
          res.status(409).json({
            code: 409,
            message: 'User has already answered this question'
          });
        } else {
          console.error(`[ERROR] reponse/create -> ${err.message || err}`);

          res.status(500).json({
            code: 500,
            message: 'Internal Server error',
            error: err.message
          });
        }
      }
    });
  }

  // Récupérer les résultats d'une question
  getQuestionResults() {
    this.app.get('/question/:questionId/resultats', async (req, res) => {
      try {
        const question = await this.QuestionModel.findById(req.params.questionId);

        if (!question) {
          res.status(404).json({
            code: 404,
            message: 'Question not found'
          });
          return;
        }

        const reponses = await this.ReponseModel.find({
          question: req.params.questionId
        });

        // Compter les réponses pour chaque option
        const resultats = question.reponsesPossibles.map((option, index) => ({
          texte: option.texte,
          count: reponses.filter((r) => r.reponseChoisie === index).length
        }));

        res.status(200).json({
          question: question.texte,
          totalReponses: reponses.length,
          resultats
        });
      } catch (err) {
        console.error(`[ERROR] question/resultats -> ${err.message || err}`);

        res.status(500).json({
          code: 500,
          message: 'Internal Server error',
          error: err.message
        });
      }
    });
  }

  run() {
    this.create();
    this.getById();
    this.getByEvent();
    this.addQuestion();
    this.answerQuestion();
    this.getQuestionResults();
  }
};

export default Sondages;
