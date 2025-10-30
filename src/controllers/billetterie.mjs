import TypeBilletModel from '../models/typeBillet.mjs';
import BilletModel from '../models/billet.mjs';
import EventModel from '../models/event.mjs';

const Billetterie = class Billetterie {
  constructor(app, connect) {
    this.app = app;
    this.TypeBilletModel = connect.model('TypeBillet', TypeBilletModel);
    this.BilletModel = connect.model('Billet', BilletModel);
    this.EventModel = connect.model('Event', EventModel);

    this.run();
  }

  // Créer un type de billet
  createTypeBillet() {
    this.app.post('/event/:eventId/type-billet', async (req, res) => {
      try {
        const typeBillet = new this.TypeBilletModel({
          ...req.body,
          event: req.params.eventId
        });

        const savedTypeBillet = await typeBillet.save();

        // Ajouter le type de billet à l'événement
        await this.EventModel.findByIdAndUpdate(
          req.params.eventId,
          { $push: { typesBillets: savedTypeBillet._id } }
        );

        res.status(201).json(savedTypeBillet);
      } catch (err) {
        console.error(`[ERROR] typeBillet/create -> ${err.message || err}`);

        res.status(500).json({
          code: 500,
          message: 'Internal Server error',
          error: err.message
        });
      }
    });
  }

  // Récupérer les types de billets d'un événement
  getTypesBillets() {
    this.app.get('/event/:eventId/types-billets', async (req, res) => {
      try {
        const typesBillets = await this.TypeBilletModel.find({
          event: req.params.eventId
        });

        res.status(200).json(typesBillets);
      } catch (err) {
        console.error(`[ERROR] typesBillets -> ${err.message || err}`);

        res.status(500).json({
          code: 500,
          message: 'Internal Server error',
          error: err.message
        });
      }
    });
  }

  // Acheter un billet
  acheterBillet() {
    this.app.post('/type-billet/:typeBilletId/acheter', async (req, res) => {
      try {
        const typeBillet = await this.TypeBilletModel.findById(
          req.params.typeBilletId
        );

        if (!typeBillet) {
          res.status(404).json({
            code: 404,
            message: 'Ticket type not found'
          });
          return;
        }

        // Vérifier s'il reste des billets disponibles
        if (typeBillet.quantiteVendue >= typeBillet.quantiteLimitee) {
          res.status(409).json({
            code: 409,
            message: 'No tickets available'
          });
          return;
        }

        // Créer le billet
        const billet = new this.BilletModel({
          typeBillet: req.params.typeBilletId,
          nom: req.body.nom,
          prenom: req.body.prenom,
          adresse: req.body.adresse
        });

        const savedBillet = await billet.save();

        // Incrémenter la quantité vendue
        await this.TypeBilletModel.findByIdAndUpdate(
          req.params.typeBilletId,
          { $inc: { quantiteVendue: 1 } }
        );

        const populatedBillet = await this.BilletModel.findById(savedBillet._id)
          .populate('typeBillet');

        res.status(201).json(populatedBillet);
      } catch (err) {
        console.error(`[ERROR] billet/acheter -> ${err.message || err}`);

        res.status(500).json({
          code: 500,
          message: 'Internal Server error',
          error: err.message
        });
      }
    });
  }

  // Récupérer les billets vendus pour un type de billet
  getBilletsByType() {
    this.app.get('/type-billet/:typeBilletId/billets', async (req, res) => {
      try {
        const billets = await this.BilletModel.find({
          typeBillet: req.params.typeBilletId
        }).populate('typeBillet');

        res.status(200).json(billets);
      } catch (err) {
        console.error(`[ERROR] billets -> ${err.message || err}`);

        res.status(500).json({
          code: 500,
          message: 'Internal Server error',
          error: err.message
        });
      }
    });
  }

  // Récupérer un billet par ID
  getBilletById() {
    this.app.get('/billet/:id', async (req, res) => {
      try {
        const billet = await this.BilletModel.findById(req.params.id)
          .populate({
            path: 'typeBillet',
            populate: { path: 'event' }
          });

        if (!billet) {
          res.status(404).json({
            code: 404,
            message: 'Ticket not found'
          });
          return;
        }

        res.status(200).json(billet);
      } catch (err) {
        console.error(`[ERROR] billet/:id -> ${err.message || err}`);

        res.status(500).json({
          code: 500,
          message: 'Internal Server error',
          error: err.message
        });
      }
    });
  }

  run() {
    this.createTypeBillet();
    this.getTypesBillets();
    this.acheterBillet();
    this.getBilletsByType();
    this.getBilletById();
  }
};

export default Billetterie;
