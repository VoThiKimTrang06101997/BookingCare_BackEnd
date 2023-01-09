import _, { reject } from "lodash";
import db from "../models/index";
import emailService from "./emailService";
require("dotenv").config();

const MAX_NUMBER_SCHEDULE = process.env.MAX_NUMBER_SCHEDULE;

let getTopDoctorHome = (limitInput) => {
  return new Promise(async (resolve, reject) => {
    try {
      let users = await db.User.findAll({
        limit: limitInput,
        // where: { roleId: "Bác sĩ" },
        where: { roleId: "R2" },
        order: [["createdAt", "DESC"]],
        attributes: {
          exclude: ["password"],
        },
        include: [
          {
            model: db.AllCode,
            as: "positionData",
            attributes: ["value_en", "value_vi"],
          },
          {
            model: db.AllCode,
            as: "genderData",
            attributes: ["value_en", "value_vi"],
          },
        ],
        raw: true,
        nest: true,
      });

      resolve({
        errorCode: 0,
        data: users,
      });
    } catch (error) {
      reject(error);
    }
  });
};

let getAllDoctors = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let doctors = await db.User.findAll({
        // where: { roleId: "Bác sĩ" },
        where: { roleId: "R2" },
        attributes: {
          exclude: ["password", "image"],
        },
      });

      resolve({
        errorCode: 0,
        data: doctors,
      });
    } catch (error) {
      reject(error);
    }
  });
};

let checkRequiredFields = (inputData) => {
  let arrayFields = [
    "doctorId",
    "contentHTML",
    "contentMarkDown",
    "action",
    "selectedPrice",
    "selectedPayment",
    "selectedProvince",
    "nameClinic",
    "addressClinic",
    "note",
    "specialtyId",
    "clinicId",
  ];

  let isValid = true;
  let element = "";
  for (let index = 0; index < arrayFields.length; index++) {
    if (!inputData[arrayFields[index]]) {
      isValid = false;
      element = arrayFields[index];
      break;
    }
  }
  return {
    isValid: isValid,
    element: element,
  };
};

let saveDetailInforDoctor = (inputData) => {
  return new Promise(async (resolve, reject) => {
    try {
      let checkObject = checkRequiredFields(inputData); // hàm checkRequiredFields được viết ở trên

      if (checkObject === false) {
        resolve({
          errorCode: 1,
          errorMessage: `Missing parameter: ${checkObject.element}`,
        });
      } else {
        // Upsert To MarkDown
        if (inputData.action === "CREATE") {
          await db.MarkDown.create({
            contentHTML: inputData.contentHTML,
            contentMarkdown: inputData.contentMarkdown,
            description: inputData.description,
            doctorId: inputData.doctorId,
          });
        } else if (inputData.action === "EDIT") {
          let doctorMarkDown = await db.MarkDown.findOne({
            where: { doctorId: inputData.doctorId },
            raw: false,
          });

          if (doctorMarkDown) {
            doctorMarkDown.doctorId = inputData.doctorId;
            doctorMarkDown.contentHTML = inputData.contentHTML;
            doctorMarkDown.contentMarkdown = inputData.contentMarkdown;
            doctorMarkDown.description = inputData.description;
            doctorMarkDown.updatedAt = new Date();
            await doctorMarkDown.save();
          }
        }

        // Upsert To Doctor_Infor Table

        let doctorInfor = await db.Doctor_Infor.findOne({
          where: {
            doctorId: inputData.doctorId,
            clinicId: inputData.clinicId,
          },
          raw: false,
        });

        if (doctorInfor) {
          // Update
          doctorInfor.doctorId = inputData.doctorId;
          doctorInfor.clinicId = inputData.clinicId;
          doctorInfor.priceId = inputData.selectedPrice;
          doctorInfor.provinceId = inputData.selectedProvince;
          doctorInfor.paymentId = inputData.selectedPayment;

          doctorInfor.nameClinic = inputData.nameClinic;
          doctorInfor.addressClinic = inputData.addressClinic;
          doctorInfor.note = inputData.note;
          doctorInfor.specialtyId = inputData.specialtyId;
          // doctorInfor.clinicId = inputData.clinicId;

          await doctorInfor.save();
        } else {
          // Create
          await db.Doctor_Infor.create({
            doctorId: inputData.doctorId,
            clinicId: inputData.clinicId,
            priceId: inputData.selectedPrice,
            provinceId: inputData.selectedProvince,
            paymentId: inputData.selectedPayment,

            nameClinic: inputData.nameClinic,
            addressClinic: inputData.addressClinic,
            note: inputData.note,
            specialtyId: inputData.specialtyId,
            // clinicId: inputData.clinicId
          });
        }

        resolve({
          errorCode: 0,
          errorMessage: "Save Information Doctor Successfully !!",
        });
      }
    } catch (error) {
      console.log("Error", error);
      reject(error);
    }
  });
};

let getDetailDoctorById = (inputId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!inputId) {
        resolve({
          errorCode: 1,
          errorMessage: "Missing parameter",
        });
      } else {
        // Select * from User where id = id chúng ta truyền vào
        let dataDoctors = await db.User.findOne({
          where: {
            id: inputId,
          },
          attributes: {
            exclude: ["password"],
          },
          include: [
            {
              model: db.MarkDown,
              attributes: ["description", "contentHTML", "contentMarkDown"],
            },
            {
              model: db.AllCode,
              as: "positionData",
              attributes: ["value_en", "value_vi"],
            },
            {
              model: db.Doctor_Infor,
              attributes: {
                exclude: ["id", "doctorId"],
              },
              include: [
                {
                  model: db.AllCode,
                  as: "priceTypeData",
                  attributes: ["value_en", "value_vi"],
                },
                {
                  model: db.AllCode,
                  as: "provinceTypeData",
                  attributes: ["value_en", "value_vi"],
                },
                {
                  model: db.AllCode,
                  as: "paymentTypeData",
                  attributes: ["value_en", "value_vi"],
                },
              ],
            },
          ],
          raw: false,
          nest: true,
        });

        if (dataDoctors && dataDoctors.image) {
          dataDoctors.image = new Buffer(dataDoctors.image, "base64").toString(
            "binary"
          );
        }

        if (!dataDoctors) dataDoctors = {};

        resolve({
          errorCode: 0,
          data: dataDoctors,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

let bulkCreateSchedule = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.arrSchedule || !data.doctorId || !data.formatedDate) {
        resolve({
          errorCode: 1,
          errorMessage: "Missing Required Parameter!",
        });
      }

      let schedule = data.arrSchedule;
      if (schedule && schedule.length > 0) {
        schedule = schedule.map((item) => {
          item.maxNumber = MAX_NUMBER_SCHEDULE;
          return item; // Tương đương với: item.timeType = item.time
        });
      }

      // Get All Existing Data
      let existing = await db.Schedule.findAll({
        where: { doctorId: data.doctorId, date: data.formatedDate },
        attributes: ["timeType", "date", "doctorId", "maxNumber"],
        raw: true,
      });

      /**
       *  // Convert Date
      if (existing && existing.length > 0) {
        existing = existing.map((item) => {
          item.date = new Date(currentDate).getTime();
          return item;
        });
      }
       */

      /**
       * let toCreate = _.differenceBy(schedule, existing, ["timeType", "date"]);
       * So sánh giữa schedule và existing có sẵn với 2 thuộc tính timeType vs date
       */

      // Compare Difference
      let toCreate = _.differenceWith(schedule, existing, (a, b) => {
        return a.timeType === b.timeType && +a.date === +b.date; // Thêm dấu cộng để chuyển biến string sang dạng số nguyên integer
      });

      /**
       *  // Check vs Compare giữa create mới và existing đã tạo rồi
      console.log("Check existing: ", existing)
      console.log("Check Create: ", schedule)
       */

      // console.log("Check difference: ", toCreate);

      // Nếu có sự khác biệt thì create data
      if (toCreate && toCreate.length > 0) {
        await db.Schedule.bulkCreate(schedule);
      }

      /**
       *   
      console.log("Data send: ", data);
      console.log("Data send: ", typeof data); // Để xem type của data
      console.log("Data send: ", data[0]);
       */

      resolve({
        errorCode: 0,
        errorMessage: "OK",
      });
    } catch (error) {
      reject(error);
    }
  });
};

let getScheduleByDate = (doctorId, date) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!doctorId || !date) {
        resolve({
          errorCode: 1,
          errorMessage: "Missing required parameter!",
        });
      } else {
        let dataSchedule = await db.Schedule.findAll({
          where: {
            doctorId: doctorId,
            date: date,
          },
          include: [
            {
              model: db.AllCode,
              as: "timeTypeData",
              attributes: ["value_en", "value_vi"],
            },
            {
              model: db.User,
              as: "doctorData",
              attributes: ["firstName", "lastName"],
            },
          ],
          raw: false,
          nest: true,
        });

        if (!dataSchedule) dataSchedule = [];
        resolve({
          errorCode: 0,
          data: dataSchedule,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

let getExtraInforDoctorById = (idInput) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!idInput) {
        resolve({
          errorCode: 1,
          errorMessage: "Missing required parameter!",
        });
      } else {
        let data = await db.Doctor_Infor.findOne({
          where: { doctorId: idInput },
          attributes: {
            exclude: ["id", "doctorId"],
          },
          include: [
            {
              model: db.AllCode,
              as: "priceTypeData",
              attributes: ["value_en", "value_vi"],
            },
            {
              model: db.AllCode,
              as: "provinceTypeData",
              attributes: ["value_en", "value_vi"],
            },
            {
              model: db.AllCode,
              as: "paymentTypeData",
              attributes: ["value_en", "value_vi"],
            },
          ],
          raw: false,
          nest: true,
        });

        if (!data) data = {};
        resolve({
          errorCode: 0,
          data: data,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

let getProfileDoctorById = (inputId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!inputId) {
        resolve({
          errorCode: 1,
          errorMessage: "Missing required parameter!",
        });
      } else {
        let dataDoctors = await db.User.findOne({
          where: {
            id: inputId,
          },
          attributes: {
            exclude: ["password"],
          },
          include: [
            {
              model: db.MarkDown,
              attributes: ["description", "contentHTML", "contentMarkDown"],
            },
            {
              model: db.AllCode,
              as: "positionData",
              attributes: ["value_en", "value_vi"],
            },
            {
              model: db.Doctor_Infor,
              attributes: {
                exclude: ["id", "doctorId"],
              },
              include: [
                {
                  model: db.AllCode,
                  as: "priceTypeData",
                  attributes: ["value_en", "value_vi"],
                },
                {
                  model: db.AllCode,
                  as: "provinceTypeData",
                  attributes: ["value_en", "value_vi"],
                },
                {
                  model: db.AllCode,
                  as: "paymentTypeData",
                  attributes: ["value_en", "value_vi"],
                },
              ],
            },
          ],
          raw: false,
          nest: true,
        });

        if (dataDoctors && dataDoctors.image) {
          dataDoctors.image = new Buffer(dataDoctors.image, "base64").toString(
            "binary"
          );
        }

        if (!dataDoctors) dataDoctors = {};

        resolve({
          errorCode: 0,
          data: dataDoctors,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

let getListPatientForDoctor = (doctorId, date) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!doctorId || !date) {
        resolve({
          errorCode: 1,
          errorMessage: "Missing required parameter!",
        });
      } else {
        let data = await db.Booking.findAll({
          where: {
            statusId: "S2",
            doctorId: doctorId,
            date: date,
          },
          include: [
            {
              model: db.User,
              as: "patientData",
              attributes: ["email", "firstName", "address", "gender"],
              include: [
                {
                  model: db.AllCode,
                  as: "genderData",
                  attributes: ["value_en", "value_vi"],
                },
              ],
            },
            {
              model: db.AllCode,
              as: "timeTypeDataPatient",
              attributes: ["value_en", "value_vi"],
            },
          ],
          raw: false,
          nest: true,
        });
        resolve({
          errorCode: 0,
          data: data,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

let sendRemedy = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.email || !data.doctorId || !data.patientId || !data.timeType) {
        resolve({
          errorCode: 1,
          errorMessage: "Missing required parameter!",
        });
      } else {
        // Update Patient Status
        let appointment = await db.Booking.findOne({
          where: {
            doctorId: data.doctorId,
            patientId: data.patientId,
            timeType: data.timeType,
            statusId: 'S2'
          },
          raw: false
        })

        if(appointment) {
          appointment.statusId = 'S3'
          await appointment.save()
        }

        // Send Email Remedy: In hóa đơn
        await emailService.sendAttachment(data);
        resolve({
          errorCode: 0,
          errorMessage: "OK"
          // data: data,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  getTopDoctorHome: getTopDoctorHome,
  getAllDoctors: getAllDoctors,
  saveDetailInforDoctor: saveDetailInforDoctor,
  getDetailDoctorById: getDetailDoctorById,
  bulkCreateSchedule: bulkCreateSchedule,
  getScheduleByDate: getScheduleByDate,
  getExtraInforDoctorById: getExtraInforDoctorById,
  getProfileDoctorById: getProfileDoctorById,
  getListPatientForDoctor: getListPatientForDoctor,
  sendRemedy: sendRemedy,
};
