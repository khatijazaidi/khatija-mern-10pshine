const { Schema, model } = require('mongoose');

const userSchema = new Schema(
  {
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true } // bcrypt hash
  },
  { timestamps: true }
);

// userSchema.index({ email: 1 }, { unique: true });

module.exports = model('User', userSchema);
