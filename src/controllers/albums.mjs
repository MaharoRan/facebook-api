import AlbumModel from '../models/album.mjs';
import EventModel from '../models/event.mjs';

const Albums = class Albums {
  constructor(app, connect) {
    this.app = app;
    this.AlbumModel = connect.model('Album', AlbumModel);
    this.EventModel = connect.model('Event', EventModel);

    this.run();
  }

  deleteById() {
    this.app.delete('/event/:eventId/album/:id', (req, res) => {
      try {
        this.AlbumModel.findByIdAndDelete(req.params.id).then((album) => {
          res.status(200).json(album || {});
        }).catch(() => {
          res.status(500).json({
            code: 500,
            message: 'Internal Server error'
          });
        });
      } catch (err) {
        console.error(`[ERROR] albums/:id -> ${err}`);

        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  showById() {
    this.app.get('/event/:eventId/album/:id', (req, res) => {
      try {
        this.AlbumModel.findById(req.params.id).then((album) => {
          res.status(200).json(album || {});
        }).catch(() => {
          res.status(500).json({
            code: 500,
            message: 'Internal Server error'
          });
        });
      } catch (err) {
        console.error(`[ERROR] albums/:id -> ${err}`);

        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  // Créer un album pour un événement
  createForEvent() {
    this.app.post('/event/:eventId/album', async (req, res) => {
      try {
        const albumModel = new this.AlbumModel({
          ...req.body,
          event: req.params.eventId
        });

        const savedAlbum = await albumModel.save();

        // Ajouter l'album à l'événement
        await this.EventModel.findByIdAndUpdate(
          req.params.eventId,
          { $push: { albums: savedAlbum._id } },
          { new: true }
        );

        res.status(201).json(savedAlbum);
      } catch (err) {
        console.error(`[ERROR] album/createForEvent -> ${err.message || err}`);

        res.status(500).json({
          code: 500,
          message: 'Internal Server error',
          error: err.message
        });
      }
    });
  }

  // Récupérer les albums d'un événement
  getByEvent() {
    this.app.get('/event/:eventId/albums', async (req, res) => {
      try {
        const albums = await this.AlbumModel.find({
          event: req.params.eventId
        }).populate('photos');

        res.status(200).json(albums);
      } catch (err) {
        console.error(`[ERROR] albums/getByEvent -> ${err.message || err}`);

        res.status(500).json({
          code: 500,
          message: 'Internal Server error',
          error: err.message
        });
      }
    });
  }

  update() {
    this.app.put('/event/:eventId/album/:id', (req, res) => {
      try {
        this.AlbumModel.findByIdAndUpdate(
          req.params.id,
          req.body,
          { new: true }
        ).then((album) => {
          if (!album) {
            return res.status(404).json({
              code: 404,
              message: 'Album not found'
            });
          }
          return res.status(200).json(album);
        }).catch((err) => {
          console.error(`[ERROR] albums/update -> ${err}`);
          return res.status(500).json({
            code: 500,
            message: 'Internal Server error'
          });
        });
      } catch (err) {
        console.error(`[ERROR] albums/update -> ${err}`);
        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  run() {
    this.createForEvent();
    this.getByEvent();
    this.showById();
    this.deleteById();
    this.update();
  }
};

export default Albums;
