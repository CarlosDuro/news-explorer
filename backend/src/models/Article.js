import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema(
  {
    keyword: { type: String, required: true },
    title: { type: String, required: true },
    text: { type: String, required: true },
    date: { type: String, required: true },
    source: { type: String, required: true },
    link: { type: String, required: true },
    image: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Article', articleSchema);
