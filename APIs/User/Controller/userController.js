const User = require("../../User/Model/userModel");
const jwt = require("jsonwebtoken");
const transport = require("../../../services/nodemailer");
const bcrypt = require("bcrypt");
const Wallet = require("../../Wallet/Model/walletModel");
const { link } = require("../Routes/userRoutes");
const Users = require("../../User/Model/userModel");

const successResponse = (res, data, statusCode = 200, message = "Success") => {
  res.status(statusCode).json({ message, data });
};

const errorResponse = (res, statusCode = 500, message = "Server Error") => {
  res.status(statusCode).json({ message });
};

//================== User Sign Up =================//

const signUp = async (req, res) => {
  console.log("=====", req.body);
  const { userName, userEmail, userPassword } = req.body;
  try {
    let user = await User.findOne({ userEmail });

    if (user) {
      return res.json({ success: false, message: "User already present!" });
    }

    const salt = 10;
    const hashedPassword = await bcrypt.hash(userPassword, salt);

    user = new User({
      userName,
      userEmail,
      userPassword: hashedPassword,
    });

    await user.save();

    const wallet = new Wallet({ userId: user._id });
    await wallet.save();

    const payload = {
      user: {
        id: user.id,
      },
    };

    const token = jwt.sign(payload, process.env.SECRET_KEY, {
      expiresIn: 24 * 60 * 60 * 730,
    });

    if (!token) {
      return res.json({ success: false, message: "Failed to generate token!" });
    }
    res.json({
      success: true,
      message: "User registered successfully!",
      data: { token, user },
    });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: err?.message || "server error" });
  }
};

//================== User Sign In ======================//

const signIn = async (req, res) => {
  const { userEmail, userPassword } = req.body;

  try {
    let user = await User.findOne({ userEmail });

    if (!user) {
      return errorResponse(res, 400, "Invalid Credentials");
    }

    const isMatch = await bcrypt.compare(userPassword, user.userPassword);

    if (!isMatch) {
      return errorResponse(res, 400, "Invalid Credentials");
    }

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.SECRET_KEY,
      { expiresIn: 24 * 60 * 60 * 730 },
      (err, token) => {
        if (err) {
          return errorResponse(res, 500, err.message);
        }
        successResponse(res, { token, user }, 200, "Sign in successful");
      }
    );
  } catch (err) {
    console.error(err.message);
    errorResponse(res);
  }
};

const getUser = async (req, res) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(200).json({
        success: false,
        message: "No Token provided, Authorization Denied",
      });
    }

    const token = authHeader.split(" ")[1];
    console.log("token -> ", token);
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    let user = await Users.findOne({ _id: decoded.user.id }).exec();
    return res.status(200).json({
      success: true,
      data: user._doc,
    });
  } catch (err) {
    res.status(200).json({
      message: "You are not Authorized person because your Token is not Valid",
    });
  }
};
//=================== Password Reset Link ===================//

const passwordResetMail = async (req, res, token) => {
  try {
    const { userEmail } = req.body;
    if (!isValidEmail(userEmail)) {
      return res.status(404).json({
        code: 404,
        message: "Your Email is not valid. Please provide a valid email",
      });
    }
    const user = await User.findOne({ where: { userEmail: userEmail } });
    if (!user) {
      return res
        .status(404)
        .json({ code: 404, message: "Please provide a valid email" });
    } else if (user) {
      const userName = user.userName;
      const userMail = user.userEmail;
      const response = await transport.mailsend({
        from: "divyanshuvashistha25@gmail.com",
        to: userEmail,
        subject: "E-Commerce Task - Password Reset",
        html: `<p><strong>Hi ${userName}</strong> <br>Please find your ${link} and CLick on your link to reset your E-Commerce Task login password. <strong></br>
                    <strong>Your Official Email Id is</strong> ${userMail} </strong></p>`,
      });
      return res.status(200).json({
        message: "Mail forwarded for Password reset successfully",
        result: response,
      });
    }
  } catch (error) {
    console.error("Error occurred while resetting the password:", error);
    return res.status(500).json({
      message: error.message || "Error occurred while resetting the password",
    });
  }
};

//==================== User Forgot Password =================//

const forgotPassword = async (req, res) => {
  try {
    const id = req.params.id;
    const { userPassword } = req.body;
    const saltRounds = 10;
    const hash = await bcrypt.hash(userPassword, saltRounds);
    const user = await User.findOne({ _id: id });
    if (user) {
      const updated = await User.updateOne({ id: id }, { userPassword: hash });
      return res.status(200).send({
        code: 200,
        message: `${user.userName}, your password has been changed successfully!`,
        data: updated,
      });
    } else {
      return res.status(404).send({ code: 404, message: "Record Not Found" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send({ code: 500, message: "Server Error" });
  }
};

//********** Function To Validate Email **********************//
function isValidEmail(email) {
  // Use a regular expression to validate the email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

//************ Function to generate a unique token *************//
const generateToken = async () => {
  return crypto.randomBytes(20).toString("hex");
};

module.exports = {
  getUser,
  signUp,
  signIn,
  passwordResetMail,
  forgotPassword,
};
