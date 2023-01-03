import db from "../models/index";
import emailService from "./emailService";
require("dotenv").config();
import { v4 as uuidv4 } from "uuid";

let buildUrlEmail = (doctorId, token) => {
  // let result = '';
  // let id = uuidv4();
  let result = `${process.env.URL_REACT}/verify-booking?token=${token}&doctorId=${doctorId}`;
  return result;
};

let postBookAppoinment = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !data.email ||
        !data.doctorId ||
        !data.timeType ||
        !data.date ||
        !data.fullName
      ) {
        resolve({
          errorCode: 1,
          errorMessage: "Missing required parameters",
        });
      } else {
        // resolve({
        //   data
        // })
        // return;
        let token = uuidv4();
        await emailService.sendSimpleEmail({
          receiverEmail: data.email,
          patientName: data.fullName,
          time: data.timeString,
          doctorName: data.doctorName,
          language: data.language,
          redirectLink: buildUrlEmail(data.doctorId, token),
        });

        // Upsert Patient
        let user = await db.User.findOrCreate({
          where: { email: data.email },
          defaults: {
            email: data.email,
            roleId: "R3",
          },
        });
        // console.log("Check User: ", user[0])

        // Create a booking record
        if (user && user[0]) {
          await db.Booking.findOrCreate({
            where: { patientId: user[0].id },
            defaults: {
              statusId: "S1",
              doctorId: data.doctorId,
              patientId: user[0].id,
              date: data.date,
              timeType: data.timeType,
              token: token,
            },
          });
        }

        resolve({
          // data: user,
          errorCode: 0,
          errorMessage: "Save Infor Patient Successfully!",
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

let postVerifyBookAppoinment = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.token || !data.doctorId) {
        resolve({
          errorCode: 1,
          errorMessage: "Missing required parameters",
        });
      } else {
        let appointment = await db.Booking.findOne({
          where: { doctorId: data.doctorId, token: data.token, statusId: "S1" },
          raw: false,
        });

        if (appointment) {
          appointment.statusId = 'S2'
          await appointment.save();
          
          resolve({
            errorCode: 0,
            errorMessage: "Update the appointment successfully!!",
          });
        } else {
          resolve({
            errorCode: 2,
            errorMessage: "Appointment has been activated or doesn't exist",
          });
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  postBookAppoinment: postBookAppoinment,
  buildUrlEmail: buildUrlEmail,
  postVerifyBookAppoinment: postVerifyBookAppoinment,
};
