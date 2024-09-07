const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  imagetext: {
    type: String,
    required: true,
    trim: true,
  },
  image: { type: String },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  likes: {
    type: Array,
    default: [],
  },
}, {
  timestamps: true, // adds createdAt and updatedAt timestamps automatically
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;