import { Schema, model } from 'mongoose';

let AuthSchema: Schema = new Schema({
  user_id: {
    type: String,
    required: true
  },
  created_on: {
    type: Date,
    default: Date.now
  }
});

export default model('Auth', AuthSchema);