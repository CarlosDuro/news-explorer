import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { JWT_SECRET } from '../config/index.js';
import { badRequest, unauthorized } from '../utils/httpErrors.js';

export async function signup(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) throw badRequest('Email already registered');
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash });
    res.status(201).json({ _id: user._id, name: user.name, email: user.email });
  } catch (e) {
    next(e);
  }
}

export async function signin(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) throw unauthorized('Invalid credentials');
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw unauthorized('Invalid credentials');
    const token = jwt.sign({ _id: user._id, email: user.email, name: user.name }, JWT_SECRET, {
      expiresIn: '7d',
    });
    res.json({ token, user: { _id: user._id, name: user.name, email: user.email } });
  } catch (e) {
    next(e);
  }
}

export async function me(req, res) {
  res.json({ user: req.user });
}
