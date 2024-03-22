const jwt = require("jsonwebtoken");
const Users = require("../APIs/User/Model/userModel");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "No Token provided, Authorization Denied" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    let user = await Users.findOne({ _id: decoded.user.id }).exec();
    req.user = user._doc;
    next();
  } catch (err) {
    res.status(401).json({
      message: "You are not Authorized person because your Token is not Valid",
    });
  }
};

module.exports = authMiddleware;
