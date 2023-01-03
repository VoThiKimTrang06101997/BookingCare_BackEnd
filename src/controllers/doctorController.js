import doctorService from "../services/doctorService";

let getTopDoctorHome = async (req, res) => {
  let limit = req.query.limit;
  if (!limit) limit = 10;
  try {
    let doctors = await doctorService.getTopDoctorHome(+limit);
    return res.status(200).json(doctors);
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      errorCode: -1,
      message: "Error from Server...",
    });
  }
};

let getAllDoctors = async (req, res) => {
  try {
    let doctors = await doctorService.getAllDoctors();
    return res.status(200).json(doctors);
  } catch (error) {
    return res.status(200).json({
      errorCode: -1,
      errorMessage: "Error from server",
    });
  }
};

let postInforDoctor = async (req, res) => {
  try {
    let response = await doctorService.saveDetailInforDoctor(req.body);
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      errorCode: -1,
      errorMessage: "Error from the server",
    });
  }
};

let getDetailDoctorById = async (req, res) => {
  try {
    let information = await doctorService.getDetailDoctorById(req.query.id);
    return res.status(200).json(information);
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      errorCode: -1,
      errorMessage: "Error from the server",
    });
  }
};

let bulkCreateSchedule = async (req, res) => {
  try {
    let information = await doctorService.bulkCreateSchedule(req.body);
    return res.status(200).json();
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      errorCode: -1,
      errorMessage: "Error from the server",
    });
  }
};

let getScheduleByDate = async (req, res) => {
  try {
    let information = await doctorService.getScheduleByDate(req.query.doctorId, req.query.date);
    return res.status(200).json(information);

  } catch (error) {
    console.log(error);
    return res.status(200).json({
      errorCode: -1,
      errorMessage: "Error from the server",
    });
  }
}

let getExtraInforDoctorById = async (req, res) => {
  try {
    let information = await doctorService.getExtraInforDoctorById(req.query.doctorId);
    return res.status(200).json(information);

  } catch (error) {
    console.log(error);
    return res.status(200).json({
      errorCode: -1,
      errorMessage: "Error from the server",
    });
  }
}

let getProfileDoctorById = async (req, res) => {
  try {
    let information = await doctorService.getProfileDoctorById(req.query.doctorId);
    return res.status(200).json(information);

  } catch (error) {
    console.log(error);
    return res.status(200).json({
      errorCode: -1,
      errorMessage: "Error from the server",
    });
  }
}

module.exports = {
  getTopDoctorHome: getTopDoctorHome,
  getAllDoctors: getAllDoctors,
  postInforDoctor: postInforDoctor,
  getDetailDoctorById: getDetailDoctorById,
  bulkCreateSchedule: bulkCreateSchedule,
  getScheduleByDate: getScheduleByDate,
  getExtraInforDoctorById: getExtraInforDoctorById,
  getProfileDoctorById: getProfileDoctorById
};
