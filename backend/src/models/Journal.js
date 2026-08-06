import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const JournalSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String },
  content: { type: String },
  generatedByAI: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default model('Journal', JournalSchema);
