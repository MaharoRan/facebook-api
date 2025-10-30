import UserModel from '../models/user.mjs';

const Users = class Users {
  constructor(app, connect) {
    this.app = app;
    this.UserModel = connect.model('User', UserModel);

    this.run();
  }

  deleteById() {
    this.app.delete('/user/:id', (req, res) => {
      try {
        this.UserModel.findByIdAndDelete(req.params.id).then((user) => {
          res.status(200).json(user || {});
        }).catch(() => {
          res.status(500).json({
            code: 500,
            message: 'Internal Server error'
          });
        });
      } catch (err) {
        console.error(`[ERROR] user/:id -> ${err}`);

        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  showById() {
    this.app.get('/user/:id', (req, res) => {
      try {
        this.UserModel.findById(req.params.id)
          .populate('groupes')
          .then((user) => {
            res.status(200).json(user || {});
          }).catch(() => {
            res.status(500).json({
              code: 500,
              message: 'Internal Server error'
            });
          });
      } catch (err) {
        console.error(`[ERROR] user/:id -> ${err}`);

        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  showAllUsers() {
    this.app.get('/users', (req, res) => {
      try {
        this.UserModel.find()
          .populate('groupes')
          .then((users) => {
            res.status(200).json(users || []);
          }).catch(() => {
            res.status(500).json({
              code: 500,
              message: 'Internal Server error'
            });
          });
      } catch (err) {
        console.error(`[ERROR] users -> ${err}`);

        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  showUsersByGroupe() {
    this.app.get('/groupe/:groupeId/users', (req, res) => {
      try {
        this.UserModel.find({ groupes: req.params.groupeId })
          .populate('groupes')
          .then((users) => {
            res.status(200).json(users || []);
          })
          .catch(() => {
            res.status(500).json({
              code: 500,
              message: 'Internal Server error'
            });
          });
      } catch (err) {
        console.error(`[ERROR] groupe/:groupeId/users -> ${err}`);

        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  create() {
    this.app.post('/user/', (req, res) => {
      try {
        const userModel = new this.UserModel(req.body);

        userModel.save().then((user) => {
          res.status(201).json(user || {});
        }).catch((err) => {
          if (err.code === 11000) {
            res.status(409).json({
              code: 409,
              message: 'Email already exists'
            });
          } else {
            res.status(500).json({
              code: 500,
              message: 'Internal Server error'
            });
          }
        });
      } catch (err) {
        console.error(`[ERROR] user/create -> ${err}`);

        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  update() {
    this.app.put('/user/:id', (req, res) => {
      try {
        this.UserModel.findByIdAndUpdate(req.params.id, req.body, { new: true })
          .then((user) => {
            res.status(200).json(user || {});
          }).catch((err) => {
            if (err.code === 11000) {
              res.status(409).json({
                code: 409,
                message: 'Email already exists'
              });
            } else {
              res.status(500).json({
                code: 500,
                message: 'Internal Server error'
              });
            }
          });
      } catch (err) {
        console.error(`[ERROR] user/update -> ${err}`);

        res.status(400).json({
          code: 400,
          message: 'Bad request'
        });
      }
    });
  }

  run() {
    this.create();
    this.showAllUsers();
    this.showById();
    this.update();
    this.deleteById();
  }
};

export default Users;
