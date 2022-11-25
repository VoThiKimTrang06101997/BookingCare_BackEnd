import db from "../models/index";
import bcrypt from "bcryptjs";

const salt = bcrypt.genSaltSync(10);

let hashUserPassword = (password) => {
  return new Promise(async (resolve, reject) => {
    try {
      var hashPassword = await bcrypt.hashSync(password, salt);
      resolve(hashPassword);
    } catch (error) {
      reject(error);
    }
  });
};

let handleUserLogin = (email, password) => {
  return new Promise(async (resolve, reject) => {
    try {
      let userData = {};

      let isExist = await checkUserEmail(email);
      if (isExist) {
        // If User has already been existed
        let user = await db.User.findOne({
          where: { email: email },
          attributes: ["email", "roleId", "password", "firstName", "lastName"],
          raw: true,
          //   attributes: {
          //     // include: [] // Define columns that want to show
          //     exclude: ["password"]  // => Define columns that don't want to show
          //   }
        });

        if (user) {
          // => Compare Password
          let check = await bcrypt.compareSync(password, user.password);
          if (check) {
            userData.errorCode = 0;
            userData.errorMessage = "Okie !";

            delete user.password; // => Ko show Password trên API.
            userData.user = user;
          } else {
            userData.errorCode = 3;
            userData.errorMessage = "Wrong Password !";
          }
        } else {
          userData.errorCode = 2;
          userData.errorMessage = "User not found !";
        }
      } else {
        // return error
        userData.errorCode = 1;
        userData.errorMessage =
          "Your Email isn't existed in your system. Please try another email !";
        resolve(userData);
      }
      resolve(userData);
    } catch (error) {
      reject(error);
    }
  });
};

let checkUserEmail = (userEmail) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await db.User.findOne({
        where: {
          email: userEmail,
        },
      });

      if (user) {
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (error) {
      reject(error);
    }
  });
};

let getAllUsers = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let users = "";
      if (userId === "ALL") {
        users = db.User.findAll({
          attributes: {
            exclude: ["password"],
          },
        });
      }
      if (userId && userId !== "ALL") {
        users = await db.User.findOne({
          where: { id: userId },
          attributes: {
            exclude: ["password"],
          },
        });
      }

      resolve(users);
    } catch (error) {
      reject(error);
    }
  });
};

let createNewUser = async (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Check Email is existed?
      let check = await checkUserEmail(data.email);
      if (check === true) {
        resolve({
          errorCode: 1,
          message:
            "Your Email has been already in use. Please try another email !",
        });
      } else {
        let hashPasswordFromBycrypt = await hashUserPassword(data.password);
        await db.User.create({
          email: data.email,
          password: hashPasswordFromBycrypt,
          firstName: data.firstName,
          lastName: data.lastName,
          address: data.address,
          phoneNumber: data.phoneNumber,
          //gender: data.gender == "1" ? true : false,
          gender: data.gender,
          roleId: data.roleId,
          positionId: data.positionId
        });
      }

      resolve({
        errorCode: 0,
        message: "OK",
      });
    } catch (error) {
      reject(error);
    }
  });
};

let deleteUser = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let foundUser = await db.User.findOne({
        where: { id: userId },
      });

      if (!foundUser) {
        resolve({
          errorCode: 2,
          errorMessage: "Users isn't existed",
        });
      }

      await db.User.destroy({
        where: { id: userId },
      });

      resolve({
        errorCode: 0,
        message: "User is deleted",
      });
    } catch (error) {
      reject(error);
    }
  });
};

let updateUser = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("Check NodeJs: ", data);
      if (!data.id || !data.roleId || !data.positionId || !data.gender) {
        resolve({
          errorCode: 2,
          errorMessage: "Missing required parameters!",
        });
      }

      let user = await db.User.findOne({
        where: {
          id: data.id,
        },
        raw: false,
      });

      if (user) {
        user.firstName = data.firstName;
        user.lastName = data.lastName;
        user.address = data.address;
        user.phoneNumber = data.phoneNumber;
        user.roleId = data.roleId;
        user.positionId = data.positionId;
        user.gender = data.gender;

        await user.save();

        // await db.User.save({
        //   firstName: data.firstName,
        //   lastName: data.lastName,
        //   address: data.address,
        //   phoneNumber: data.phoneNumber,
        // });

        // let allUsers = await db.User.findAll();
        resolve({
          errorCode: 0,
          message: "Update User successfully !",
        });
      } else {
        resolve({
          errorCode: 1,
          message: "User not found !",
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

let getAllCodeService = (typeInput) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!typeInput) {
        resolve({
          errorCode: 1,
          errorMessage: "Missing required parameters !",
        });
      } else {
        let res = {};
        let allCode = await db.AllCode.findAll({
          attributes: { exclude: ["createdAt", "updatedAt"] },
          where: { type: typeInput },
        });

        res.errorCode = 0;
        res.data = allCode;

        resolve(res);
      }
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  handleUserLogin: handleUserLogin,
  checkUserEmail: checkUserEmail,
  getAllUsers: getAllUsers,
  createNewUser: createNewUser,
  hashUserPassword: hashUserPassword,
  deleteUser: deleteUser,
  updateUser: updateUser,
  getAllCodeService: getAllCodeService,
};
