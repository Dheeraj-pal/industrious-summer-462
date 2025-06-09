const express = require("express");
const cors = require("cors");
const { connection } = require("./config/db");
const { noteRouter } = require("./routes/product.route");
const { userRouter } = require("./routes/user.routes");
const { authenticate } = require("./middlewares/authenticate.middleware");
require("dotenv").config() 

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

app.get("/", (req, res) => {
  res.send("Welcome");
});

app.use("/users", userRouter);
// app.use(authenticate);
app.use("/products", noteRouter);

app.listen(process.env.PORT, async () => {
  try {
    await connection;
    console.log("Server running on port:", process.env.PORT)
    console.log("connected to DB");
  } catch (error) {
    console.log(error, "unable to connect to DB");
  }
});
