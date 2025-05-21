const User = require('../models/user');

const userCtrl = {};

userCtrl.getUsers = async (req, res) => {
  const users = await User.find().populate('role');
  res.json(users);
};

userCtrl.getUser = async (req, res) => {
  const user = await User.findById(req.params.id).populate('role');
  res.json(user);
};

userCtrl.updateUser = async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ status: 'Usuario actualizado' });
};

userCtrl.deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ status: 'Usuario eliminado' });
};

module.exports = userCtrl;