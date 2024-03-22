const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();
const db = require("..//APIs/User/Model/userModel");

const Announcement = db.announcement;

module.exports.mailsend = async (body, mail_data) => {
  let transporter = await nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,

    secure: false,
    requireTLS: true,
    auth: {
      user: "divyanshuvashistha25@gmail.com",
      pass: "poicbwolqyykqnml",
    },
    logger: false,
    debug: false,
    tls: {
      rejectUnauthorized: false,
    },
  });

  let email_detail;
  if (typeof mail_data == "number") {
    email_detail = mail_data;
  } else if (mail_data) {
    email_detail = mail_data.dataValues.email_id;
  }

  if (email_detail) {
    let anouncedata = await Announcement.findOne({
      where: { email_id: email_detail },
    });
    let updateData = await Announcement.update(
      { email_status: "send" },
      {
        where: { email_id: anouncedata.dataValues.email_id },
      }
    );
  }

  const mailInfo = await transporter.sendMail(body);
  if (!mailInfo) {
    console.log("Error occurred");
    console.log(error);
    return false;
  } else {
    console.log("Message sent successfully!");
    return mailInfo;
  }
};
