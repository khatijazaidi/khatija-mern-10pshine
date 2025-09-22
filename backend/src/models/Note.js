const { Schema, model, Types } = require('mongoose');

const noteSchema = new Schema(
  {
    user:   { type: Types.ObjectId, ref: 'User', required: true, index: true },
    title:  { type: String, default: '' },
    content:{ type: String, default: '' } // store rich-text HTML
  },
  { timestamps: true }
);

module.exports = model('Note', noteSchema);
