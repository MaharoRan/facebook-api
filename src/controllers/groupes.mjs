import GroupeModel from '../models/groupe.mjs';
import UserModel from '../models/user.mjs';

const Groupes = class Groupes {
  constructor(app, connect) {
    this.app = app;
    this.GroupeModel = connect.model('Groupe', GroupeModel);
    this.UserModel = connect.model('User', UserModel);

    this.run();
  }

  deleteById() {
    this.app.delete('/groupe/:id', (req, res) => {
      try {
        this.GroupeModel.findByIdAndDelete(req.params.id).then((groupe) => {
          res.status(200).json(groupe || {});
        }).catch(() => {
          res.status(500).json({
            code: 500,
            message: 'Internal Server error'
          });
        });
      } catch (err) {
        console.error(`[ERROR] groupe/:id -> ${err}`);

        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  showById() {
    this.app.get('/groupe/:id', (req, res) => {
      try {
        this.GroupeModel.findById(req.params.id)
          .populate('membres')
          .populate('admins')
          .then((groupe) => {
            res.status(200).json(groupe || {});
          })
          .catch(() => {
            res.status(500).json({
              code: 500,
              message: 'Internal Server error'
            });
          });
      } catch (err) {
        console.error(`[ERROR] groupe/:id -> ${err}`);

        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  showAllGroupes() {
    this.app.get('/groupes', (req, res) => {
      try {
        this.GroupeModel.find()
          .populate('membres')
          .populate('admins')
          .then((groupes) => {
            res.status(200).json(groupes || []);
          })
          .catch(() => {
            res.status(500).json({
              code: 500,
              message: 'Internal Server error'
            });
          });
      } catch (err) {
        console.error(`[ERROR] groupes -> ${err}`);

        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  addMembre() {
    this.app.post('/groupe/:id/membre/:userId', async (req, res) => {
      try {
        // Add user to group
        const groupe = await this.GroupeModel.findByIdAndUpdate(
          req.params.id,
          { $addToSet: { membres: req.params.userId } },
          { new: true }
        )
          .populate('membres')
          .populate('admins');

        if (!groupe) {
          res.status(404).json({
            code: 404,
            message: 'Group not found'
          });
          return;
        }

        // Add group to user
        await this.UserModel.findByIdAndUpdate(
          req.params.userId,
          { $addToSet: { groupes: req.params.id } },
          { new: true }
        );

        res.status(200).json(groupe);
      } catch (err) {
        console.error(`[ERROR] groupe/:id/membre/:userId -> ${err.message || err}`);

        res.status(500).json({
          code: 500,
          message: 'Internal Server error',
          error: err.message
        });
      }
    });
  }

  removeMembre() {
    this.app.delete('/groupe/:id/membre/:userId', async (req, res) => {
      try {
        // Remove user from group members and admins
        const groupe = await this.GroupeModel.findByIdAndUpdate(
          req.params.id,
          {
            $pull: {
              membres: req.params.userId,
              admins: req.params.userId
            }
          },
          { new: true }
        )
          .populate('membres')
          .populate('admins');

        if (!groupe) {
          res.status(404).json({
            code: 404,
            message: 'Group not found'
          });
          return;
        }

        // Remove group from user
        await this.UserModel.findByIdAndUpdate(
          req.params.userId,
          { $pull: { groupes: req.params.id } },
          { new: true }
        );

        res.status(200).json(groupe);
      } catch (err) {
        console.error(`[ERROR] groupe/:id/membre/:userId -> ${err.message || err}`);

        res.status(500).json({
          code: 500,
          message: 'Internal Server error',
          error: err.message
        });
      }
    });
  }

  addAdmin() {
    this.app.post('/groupe/:id/admin/:userId', async (req, res) => {
      try {
        // First, check if the user is already a member of the group
        const groupe = await this.GroupeModel.findById(req.params.id);

        if (!groupe) {
          res.status(404).json({
            code: 404,
            message: 'Group not found'
          });
          return;
        }

        // Check if user is a member
        const isMember = groupe.membres.some(
          (membreId) => membreId.toString() === req.params.userId
        );

        if (!isMember) {
          res.status(403).json({
            code: 403,
            message: 'User must be a member of the group before becoming an admin'
          });
          return;
        }
        else{
          // User is already a member, proceed to add as admin
          // Add user to admins
        const updatedGroupe = await this.GroupeModel.findByIdAndUpdate(
          req.params.id,
          { $addToSet: { admins: req.params.userId } },
          { new: true }
        )
          .populate('membres')
          .populate('admins');

        res.status(200).json(updatedGroupe);
        }
      } catch (err) {
        console.error(`[ERROR] groupe/:id/admin/:userId -> ${err.message || err}`);

        res.status(500).json({
          code: 500,
          message: 'Internal Server error',
          error: err.message
        });
      }
    });
  }

  create() {
    this.app.post('/groupe/', (req, res) => {
      try {
        const groupeModel = new this.GroupeModel(req.body);

        groupeModel.save().then((groupe) => {
          res.status(201).json(groupe || {});
        }).catch(() => {
          res.status(500).json({
            code: 500,
            message: 'Internal Server error'
          });
        });
      } catch (err) {
        console.error(`[ERROR] groupe/create -> ${err}`);

        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  update() {
    this.app.put('/groupe/:id', (req, res) => {
      try {
        this.GroupeModel.findByIdAndUpdate(req.params.id, req.body, { new: true })
          .populate('membres')
          .populate('admins')
          .then((groupe) => {
            res.status(200).json(groupe || {});
          })
          .catch(() => {
            res.status(500).json({
              code: 500,
              message: 'Internal Server error'
            });
          });
      } catch (err) {
        console.error(`[ERROR] groupe/update -> ${err}`);

        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  run() {
    this.create();
    this.showAllGroupes();
    this.showById();
    this.update();
    this.addMembre();
    this.removeMembre();
    this.addAdmin();
    this.deleteById();
  }
};

export default Groupes;
