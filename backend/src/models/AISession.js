import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const AISessionSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  transcript: { type: String },
  analysis: { type: Schema.Types.Mixed },
  journalId: { type: Schema.Types.ObjectId, ref: 'Journal' },
  wellnessPlan: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
});

export default model('AISession', AISessionSchema);
