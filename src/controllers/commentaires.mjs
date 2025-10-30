import CommentaireModel from '../models/commentaire.mjs';
import PhotoModel from '../models/photo.mjs';

const Commentaires = class Commentaires {
  constructor(app, connect) {
    this.app = app;
    this.CommentaireModel = connect.model('Commentaire', CommentaireModel);
    this.PhotoModel = connect.model('Photo', PhotoModel);

    this.run();
  }

  // Ajouter un commentaire à une photo
  create() {
    this.app.post('/photo/:photoId/commentaire', async (req, res) => {
      try {
        const commentaire = new this.CommentaireModel({
          ...req.body,
          photo: req.params.photoId
        });

        const savedCommentaire = await commentaire.save();

        // Ajouter le commentaire à la photo
        await this.PhotoModel.findByIdAndUpdate(
          req.params.photoId,
          { $push: { commentaires: savedCommentaire._id } }
        );

        const populatedCommentaire = await this.CommentaireModel.findById(
          savedCommentaire._id
        ).populate('auteur');

        res.status(201).json(populatedCommentaire);
      } catch (err) {
        console.error(`[ERROR] commentaire/create -> ${err.message || err}`);

        res.status(500).json({
          code: 500,
          message: 'Internal Server error',
          error: err.message
        });
      }
    });
  }

  // Récupérer les commentaires d'une photo
  getByPhoto() {
    this.app.get('/photo/:photoId/commentaires', async (req, res) => {
      try {
        const commentaires = await this.CommentaireModel.find({
          photo: req.params.photoId
        })
          .populate('auteur')
          .sort({ dateCreation: -1 });

        res.status(200).json(commentaires);
      } catch (err) {
        console.error(`[ERROR] commentaires -> ${err.message || err}`);

        res.status(500).json({
          code: 500,
          message: 'Internal Server error',
          error: err.message
        });
      }
    });
  }

  // Supprimer un commentaire
  deleteById() {
    this.app.delete('/commentaire/:id', async (req, res) => {
      try {
        const commentaire = await this.CommentaireModel.findByIdAndDelete(
          req.params.id
        );

        if (!commentaire) {
          res.status(404).json({
            code: 404,
            message: 'Comment not found'
          });
          return;
        }

        // Retirer le commentaire de la photo
        await this.PhotoModel.findByIdAndUpdate(
          commentaire.photo,
          { $pull: { commentaires: commentaire._id } }
        );

        res.status(200).json(commentaire);
      } catch (err) {
        console.error(`[ERROR] commentaire/:id -> ${err.message || err}`);

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
    this.getByPhoto();
    this.deleteById();
  }
};

export default Commentaires;
