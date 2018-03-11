import { Schema, model } from 'mongoose';
import * as bcrypt from 'bcrypt-nodejs';

let UserSchema: Schema = new Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String
  },
  status: {
    type: Number,
    default: 1 // active 
  },
  role: {
    type: String,
    enum: ['admin', 'reader', 'author', 'publisher', 'editor'],
    default : 'reader' // reader is end user
  },
  created_on: {
    type: Date,
    default: Date.now
  }
});

/*
*Schema methods
*/
UserSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

UserSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password.toString(), this.password);
};

export default model('User', UserSchema);