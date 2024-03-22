const mongoose = require("mongoose");

mongoose
  .connect("mongodb://127.0.0.1:27017/eCommerceTask", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("You are now Connected with your MongoDB"))
  .catch((err) => console.error("Unable to Connect with DB", err));
