import specialtyService from "../services/specialtyService";

let createSpecialty = async (req, res) => {
    try {
        let infor = await specialtyService.createSpecialty(req.body)
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

let getAllSpecialty = async (req, res) => {
    try {
        let infor = await specialtyService.getAllSpecialty()
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

let getDetailSpecialtyById = async (req, res) => {
    try {
        let infor = await specialtyService.getDetailSpecialtyById(req.query.id, req.query.location)
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
    createSpecialty: createSpecialty,
    getAllSpecialty: getAllSpecialty,
    getDetailSpecialtyById: getDetailSpecialtyById
}