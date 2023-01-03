import patientService from "../services/patientService";

let postBookAppoinment = async (req, res) => {
    try {
        let infor = await patientService.postBookAppoinment(req.body);
        return res.status(200).json(
            infor
        )
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errorCode: -1,
            errorMessage: "Error from Server"
        })
    }
}

let postVerifyBookAppoinment = async (req, res) => {
    try {
        let infor = await patientService.postVerifyBookAppoinment(req.body);
        return res.status(200).json(
            infor
        )
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errorCode: -1,
            errorMessage: "Error from Server"
        })
    }
}

module.exports = {
    postBookAppoinment: postBookAppoinment,
    postVerifyBookAppoinment: postVerifyBookAppoinment
}
