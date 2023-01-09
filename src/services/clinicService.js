import db from "../models/index";
require("dotenv").config();

let createClinic = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !data.name ||
        !data.address ||
        !data.imageBase64 ||
        !data.descriptionHTML ||
        !data.descriptionMarkDown
      ) {
        resolve({
          errorCode: 1,
          errorMessage: "Missing required parameters",
        });
      } else {
        await db.Clinic.create({
          name: data.name,
          address: data.address,
          image: data.imageBase64,
          descriptionHTML: data.descriptionHTML,
          descriptionMarkDown: data.descriptionMarkDown,
        });

        resolve({
          errorCode: 0,
          errorMessage: "OK",
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

let getAllClinic = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let data = await db.Clinic.findAll({
        // attributes: {
        //   exclude: ['image']
        // }
      });
      // Encode vs Decode file image
      if (data && data.length > 0) {
        data.map((item) => {
          item.image = new Buffer(item.image, "base64").toString("binary");
          return item;
        });
      }
      resolve({
        errorCode: 0,
        errorMessage: "OK",
        data,
      });
    } catch (error) {
      reject(error);
    }
  });
};

let getDetailClinicById = (inputId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!inputId) {
        resolve({
          errorCode: 1,
          errorMessage: "Missing the required parameters !!",
        });
      } else {
        let data = await db.Clinic.findOne({
          where: { id: inputId },
          attributes: ["name", "address", "descriptionHTML", "descriptionMarkDown"],
        });

        if (data) {
          let doctorClinic = [];

          doctorClinic = await db.Doctor_Infor.findAll({
            where: { clinicId: inputId },
            attributes: ["doctorId", "provinceId"],
          });

          data.doctorClinic = doctorClinic;
        } else data = {};
        resolve({
          errorCode: 0,
          errorMessage: "OK",
          data,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  createClinic: createClinic,
  getAllClinic: getAllClinic,
  getDetailClinicById: getDetailClinicById,
};
