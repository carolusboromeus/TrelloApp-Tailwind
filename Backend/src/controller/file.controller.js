// const {uploadFileMiddleware} = require("../middleware/upload");
const fs = require("fs");
const baseUrl = "http://dmdev.byonchat2.com:6969/files/";

const uploadFile = (req, res) => {
    try {
        if (req.file == undefined) {
            return res.status(400).send({ message: "Please upload a file!" });
        }

        const imageData = req.file;
    
        console.log("Uploaded the file successfully");

        res.status(200).send({imageData});
    } catch (err) {
        console.log("error  " + err);
        res.status(500).send({
            message: `Could not upload the file:. ${err}`,
        });
    }
};

const deleteFile = (req, res) => {
    const directoryPath = __basedir + "/assets/uploads/";
    if(req.body.newFile && req.body.newFile._id){
        fs.unlink(`${directoryPath}${req.body.newFile.data}`, (err) => {
            if (err) {
                res.status(500).send({
                    message: "Could not delete the file. " + err,
                });
            }

            console.log('File deleted successfully');
        });
    }
};

const getListFiles = (req, res) => {
    const directoryPath = __basedir + "/assets/uploads/";

    fs.readdir(directoryPath, function (err, files) {
        if (err) {
        res.status(500).send({
            message: "Unable to scan files!",
        });
        }

        let fileInfos = [];

        files.forEach((file) => {
            fileInfos.push({
                name: file,
                url: baseUrl + file,
            });
        });

        res.status(200).send(fileInfos);
    });
};

const downloadFile = (req, res) => {
    const fileName = req.params.name;
    const directoryPath = __basedir + "/assets/uploads/";

    res.download(directoryPath + fileName, fileName, (err) => {
        if (err) {
            res.status(500).send({
                message: "Could not download the file. " + err,
            });
        }
    });
};

module.exports = {
    uploadFile,
    deleteFile,
    getListFiles,
    downloadFile,
};