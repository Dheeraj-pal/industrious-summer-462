const express = require("express");
const cors = require("cors");
const { connection } = require("./config/db");
const { noteRouter } = require("./routes/product.route");
const { userRouter } = require("./routes/user.routes");
const { authenticate } = require("./middlewares/authenticate.middleware");

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

app.listen(1999, async () => {
  try {
    await connection;
    console.log("connected to DB");
  } catch (error) {
    console.log(error, "unable to connect to DB");
  }
});
