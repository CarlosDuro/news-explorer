import mongoose from 'mongoose';
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, minlength: 2, maxlength: 30 },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true, select: false },
  },
  { timestamps: true }
);
export default mongoose.model('User', userSchema);
