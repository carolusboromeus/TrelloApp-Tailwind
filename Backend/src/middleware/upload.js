const multer = require("multer");
const maxSize = 2 * 1024 * 1024;
const ObjectId = require('mongoose').Types.ObjectId;
const path = require("path");
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = `${__basedir}/assets/uploads/`;

        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, __basedir + "/assets/uploads/");
    },
    filename: function (req, file, cb) {
        // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const objectId = new ObjectId().toString(); 
        
        if(file.originalname === "blob"){
            const type = file.mimetype.split("/");
            type.reverse();
            cb(null, objectId+`.${type[0]}`);
        } else{
            cb(null, objectId+path.extname(file.originalname));
        }
    }
});

const upload = multer({ storage, limits: { fileSize: maxSize }});
module.exports = upload;