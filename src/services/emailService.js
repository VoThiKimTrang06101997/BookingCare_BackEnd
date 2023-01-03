require("dotenv").config();
const nodemailer = require("nodemailer");

// import nodemailer from "nodemailer"

let sendSimpleEmail = async (dataSend) => {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_APP, // generated ethereal user
      pass: process.env.EMAIL_APP_PASSWORD, // generated ethereal password
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Võ Thị Kim Trang 👻" <vothikimtrang0610@gmail.com>', // sender address
    to: dataSend.receiverEmail, // list of receivers
    subject: "Thông tin đặt lịch khám bệnh ✔", // Subject line
    // text: "Hello world?", // plain text body
    html:getBodyHTMLEmail(dataSend)
 });
};

let getBodyHTMLEmail = (dataSend) => {
    let result = '';
    if(dataSend.language === 'vi') {
        result =  `
        <h3>Xin chào ${dataSend.patientName}!</h3>
        <p>Bạn nhận được email này vì đã đặt lịch khám bệnh online trên BookingCare Clone</p>
        <p>Thông tin đặt lịch khám bệnh:</p>
        <div><b>Thời gian: ${dataSend.time}</b></div>
        <div><b>Bác sĩ: ${dataSend.doctorName}</b></div>
    
        <p>Nếu các thông tin trên là đúng sự thật. Vui lòng Click vào đường link bên dưới để xác nhận và hoàn tất thủ tục đặt lịch khám bệnh.</p>
        <div>
        <a href=${dataSend.redirectLink} target="_blank">Click here</a>
        </div>
    
        <div>Xin chân thành cảm ơn !!</div>
        ` // html body
    }
    if(dataSend.language === 'en') {
        result = `
        <h3>Hello ${dataSend.patientName}!</h3>
        <p>You received this email because you booked an online medical appointment on website of BookingCare Clone</p>
        <p>Information to schedule an appointment:</p>
        <div><b>Time: ${dataSend.time}</b></div>
        <div><b>Doctor: ${dataSend.doctorName}</b></div>
    
        <p>If the above information is true. Please click on the link below to confirm and complete the procedure to book an appointment.</p>
        <div>
        <a href=${dataSend.redirectLink} target="_blank">Click here</a>
        </div>
    
        <div>Sincerely Thank !!</div>
        ` // html body
    }
    return result;
}

module.exports = {
  sendSimpleEmail: sendSimpleEmail,
  getBodyHTMLEmail: getBodyHTMLEmail
};
