import db from "../models/index";
require("dotenv").config();

let createSpecialty = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !data.name ||
        !data.imageBase64 ||
        !data.descriptionHTML ||
        !data.descriptionMarkDown
      ) {
        resolve({
          errorCode: 1,
          errorMessage: "Missing required parameters",
        });
      } else {
        await db.Specialty.create({
          name: data.name,
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

let getAllSpecialty = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let data = await db.Specialty.findAll({
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

let getDetailSpecialtyById = (inputId, location) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!inputId || !location) {
        resolve({
          errorCode: 1,
          errorMessage: "Missing the required parameters !!",
        });
      } else {
        let data = await db.Specialty.findOne({
          where: { id: inputId },
          attributes: ["descriptionHTML", "descriptionMarkDown"],
        });

        if (data) {
          let doctorSpecialty = [];
          if (location === "ALL") {
            doctorSpecialty = await db.Doctor_Infor.findAll({
              where: { specialtyId: inputId },
              attributes: ["doctorId", "provinceId"],
            });
          } else {
            // Find by location
            doctorSpecialty = await db.Doctor_Infor.findAll({
              where: { specialtyId: inputId, provinceId: location },
              attributes: ["doctorId", "provinceId"],
            });
          }
          data.doctorSpecialty = doctorSpecialty;
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
  createSpecialty: createSpecialty,
  getAllSpecialty: getAllSpecialty,
  getDetailSpecialtyById: getDetailSpecialtyById,
};
