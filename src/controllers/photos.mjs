import mongoose from 'mongoose';
import PhotoModel from '../models/photo.mjs';
import AlbumModel from '../models/album.mjs';

const Photos = class Photos {
  constructor(app, connect) {
    this.app = app;
    this.PhotoModel = connect.model('Photo', PhotoModel);
    this.AlbumModel = connect.model('Album', AlbumModel);

    this.run();
  }

  deleteById() {
    this.app.delete('/album/:idalbum/photo/:idphoto', async (req, res) => {
      try {
        // Trim and validate ObjectIds to avoid CastError
        const idphoto = String(req.params.idphoto || '').trim();
        const idalbum = String(req.params.idalbum || '').trim();

        if (
          !mongoose.Types.ObjectId.isValid(idphoto)
          || !mongoose.Types.ObjectId.isValid(idalbum)
        ) {
          return res.status(400).json({
            code: 400,
            message: 'Invalid photo or album ID format'
          });
        }

        // Remove the photo
        const deletedPhoto = await this.PhotoModel.findByIdAndDelete(idphoto);

        if (deletedPhoto) {
          // Remove the photo reference from the album
          await this.AlbumModel.findByIdAndUpdate(
            idalbum,
            { $pull: { photos: deletedPhoto._id } },
            { new: true }
          );

          return res.status(200).json(deletedPhoto);
        }

        return res.status(404).json({
          code: 404,
          message: 'Photo not found'
        });
      } catch (err) {
        console.error(`[ERROR] photos/:id -> ${err}`);

        return res.status(500).json({
          code: 500,
          message: 'Internal Server error'
        });
      }
    });
  }

  showById() {
    this.app.get('/album/:idalbum/photo/:idphoto', async (req, res) => {
      try {
        // Trim and validate ObjectIds to avoid CastError
        const idphoto = String(req.params.idphoto || '').trim();
        const idalbum = String(req.params.idalbum || '').trim();

        if (
          !mongoose.Types.ObjectId.isValid(idphoto)
          || !mongoose.Types.ObjectId.isValid(idalbum)
        ) {
          return res.status(400).json({
            code: 400,
            message: 'Invalid photo or album ID format'
          });
        }

        const photo = await this.PhotoModel.findOne({
          _id: idphoto,
          album: idalbum
        }).populate('album', 'title description').exec();

        if (!photo) {
          return res.status(404).json({
            code: 404,
            message: 'Photo not found'
          });
        }

        return res.status(200).json(photo);
      } catch (err) {
        console.error(`[ERROR] photos/:idalbum/photo/:idphoto -> ${err}`);
        return res.status(500).json({
          code: 500,
          message: 'Internal Server error'
        });
      }
    });
  }

  showAllPhotos() {
    this.app.get('/album/:idalbum/photos', async (req, res) => {
      try {
        const photos = await this.PhotoModel.find({ album: req.params.idalbum })
          .populate('album', 'title description')
          .exec();

        return res.status(200).json(photos || []);
      } catch (err) {
        console.error(`[ERROR] photos -> ${err}`);

        return res.status(500).json({
          code: 500,
          message: 'Internal Server error'
        });
      }
    });
  }

  create() {
    this.app.post('/album/:idalbum/photo', async (req, res) => {
      try {
        // Add the album reference to the photo
        const photoData = { ...req.body, album: req.params.idalbum };
        const photoModel = new this.PhotoModel(photoData);

        // Save the photo first
        const savedPhoto = await photoModel.save();

        // Update the album's photos array
        await this.AlbumModel.findByIdAndUpdate(
          req.params.idalbum,
          { $push: { photos: savedPhoto._id } },
          { new: true }
        ).populate('photos');

        return res.status(200).json(savedPhoto || {});
      } catch (err) {
        console.error(`[ERROR] photos/create -> ${err}`);

        return res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  update() {
    this.app.put('/album/:idalbum/photo/:idphoto', (req, res) => {
      try {
        // Trim and validate ObjectId for photo
        const idphoto = String(req.params.idphoto || '').trim();
        if (!mongoose.Types.ObjectId.isValid(idphoto)) {
          return res.status(400).json({
            code: 400,
            message: 'Invalid photo ID format'
          });
        }

        return this.PhotoModel.findByIdAndUpdate(
          idphoto,
          req.body,
          { new: true }
        ).then((photo) => {
          if (!photo) {
            return res.status(404).json({
              code: 404,
              message: 'Photo not found'
            });
          }
          return res.status(200).json(photo);
        }).catch((err) => {
          console.error(`[ERROR] photos/update -> ${err}`);
          return res.status(500).json({
            code: 500,
            message: 'Internal Server error'
          });
        });
      } catch (err) {
        console.error(`[ERROR] photos/update -> ${err}`);
        return res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  run() {
    this.create();
    this.showById();
    this.showAllPhotos();
    this.deleteById();
    this.update();
  }
};

export default Photos;
