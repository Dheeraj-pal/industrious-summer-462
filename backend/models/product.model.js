const mongoose = require("mongoose");

const noteSchema = mongoose.Schema({
  title: String,
  img: String,
  review: String,
  category: String,
  price: String,
  // userID: String,
});

const NoteModel = mongoose.model("product", noteSchema);

module.exports = {
  NoteModel,
};
