const express = require("express");
const path = require("path");
const cors = require("cors");
const http = require("http");
const db = require("./config/dbConfig");

const dotenv = require("dotenv");
var bodyParser = require("body-parser");

dotenv.config();

const app = express();

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

const socketIo = require("socket.io");
const server = http.createServer(app);

// previous
const io = socketIo(server);
require("./services/index")(io);

//================= Cors ===================//

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: true }));

//============ Express ===========//

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the E-Commerce Task Back-End!" });
});

//===================== Serve static files ========================//
app.use(express.static("public"));
//============================= Routes =================================//

const userRoutes = require("./APIs/User/Routes/userRoutes");
const productRoutes = require("./APIs/Product/Routes/productRoutes");
const walletRoutes = require("./APIs/Wallet/Routes/walletRoutes");
const cartRoutes = require("./APIs/Cart/Routes/cartRoutes");

app.use("/user", userRoutes);
app.use("/products", productRoutes);
app.use("/wallet", walletRoutes);
app.use("/cart", cartRoutes);

//================== Server ==================//

const PORT = process.env.PORT || 8001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});