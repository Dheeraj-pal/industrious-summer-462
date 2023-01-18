const express = require("express");
const { NoteModel } = require("../models/product.model");
const noteRouter = express.Router();

noteRouter.get("/", async (req, res) => {
  const data = await NoteModel.find();
  res.send(data);
});

noteRouter.post("/create", async (req, res) => {
  const payload = req.body;
  try { 
    const new_note = new NoteModel(payload);
    await new_note.save();
    res.send("created the note");
  } catch (err) {
    console.log(err);
    res.send("something went wrong on posting the note");
  }
});

noteRouter.patch("/update/:id", async (req, res) => {
  const add_data = req.body;
  const ID = req.params.id;
  const note = await NoteModel.findOne({ _id: ID });
  const userID_in_note = note.userID;
  const userID_making_req = req.body.userID;

  try {
    if (userID_making_req !== userID_in_note) { 
      res.send("you are not authorized");
    } else {
      await NoteModel.findByIdAndUpdate({ _id: ID }, add_data);
      res.send({ msg: `Note with id: ${ID} Updated successfully` });
    }
  } catch (error) {
    console.log(error);
    console.log(`Error occurred while updating the note with id:${ID}`);
  }
});
+
noteRouter.delete("/delete/:id", async (req, res) => {
  const ID = req.params.id;
  const note = await NoteModel.findOne({ _id: ID });
  const userID_in_note = note.userID;
  const userID_making_req = req.body.userID;

  try {
    if (userID_making_req !== userID_in_note) {
      res.send("you are not authorized");
    } else {
      await NoteModel.findByIdAndDelete({ _id: ID });
      res.send({ msg: `Note with id: ${ID} deleted successfully` });
    }
  } catch (error) {
    console.log(error);
    console.log(`Error occurred while deleting the note with id:${ID}`);
  }
});

module.exports = {
  noteRouter,
};
