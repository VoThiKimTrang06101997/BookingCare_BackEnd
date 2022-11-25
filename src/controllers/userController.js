import userService from "../services/userService";

let handleLogin = async (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  // if(email === '' || email === null || email === "undefined") = if(!email)

  if (!email || !password) {
    return res.status(500).json({
      errorCode: 1,
      message: "Missing inputs parameter!",
    });
  }

  let userData = await userService.handleUserLogin(email, password);
  /**
     *  Check email exist
        Compare password
        return userInformation
        access_token: JWT
     */
  return res.status(200).json({
    errorCode: userData.errorCode,
    message: userData.errorMessage,
    user: userData.user ? userData.user : {},
  });
};

let handleGetAllUsers = async (req, res) => {
  // let id = req.body.id; // ALL: Lấy tất cả người dùng; id: Lấy id 1 người dùng

  let id = req.query.id;

  if (!id) {
    return res.status(200).json({
      errorCode: 0,
      errorMessage: "Missing required parameters",
      users: [],
    });
  }

  let users = await userService.getAllUsers(id);
  console.log(users);
  return res.status(200).json({
    errorCode: 0,
    errorMessage: "Okie",
    users,
  });
};

let handleCreateNewUser = async (req, res) => {
  let message = await userService.createNewUser(req.body);
  console.log(message)
  return res.status(200).json(message)
}

let handleEditUser = async (req, res) => {
  let data = req.body;
  let message = await userService.updateUser(data);

  return res.status(200).json(message)
}

let handleDeleteUser = async (req, res) => {
  if(!req.body.id) {
    return res.status(200).json({
      errorCode: 1,
      errorMessage: "Missing required parameters!"
    })
  }
  let message = await userService.deleteUser(req.body.id);
  return res.status(200).json(message)
}

let getAllCode = async (req, res) => {
  try {
    /**
     * Code minh họa cho setTimeOut => Sau 5000ms hiển thị chữ isLoadingGender xong thì mới render dữ liệu gender ra.
     *  setTimeout(async () => {
      let data = await userService.getAllCodeService(req.query.type);
      console.log(data)
      return res.status(200).json(data);
    }, 5000)
     */
  
    let data = await userService.getAllCodeService(req.query.type);
    console.log(data)
    return res.status(200).json(data);
    
  } catch (error) {
    return res.status(200).json({
      errorCode: -1,
      errorMessage: 'Error from Server'
    })
  }
}

module.exports = {
  handleLogin: handleLogin,
  handleGetAllUsers: handleGetAllUsers,
  handleCreateNewUser: handleCreateNewUser,
  handleEditUser: handleEditUser,
  handleDeleteUser: handleDeleteUser,
  getAllCode: getAllCode
};
