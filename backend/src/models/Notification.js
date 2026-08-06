import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const NotificationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  title: { type: String },
  body: { type: String },
  read: { type: Boolean, default: false },
  meta: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
});

export default model('Notification', NotificationSchema);
