//const mongoose = require('mongoose');
//const Client = require('./db.cjs');
//const ObjectId = require('mongoose').Types.ObjectId;

const fs = require('fs');

let bucket;
// const storage = (async () => {
//     try {
//         await Client;
//         const { db } = mongoose.connection;
//         bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'files' });
//     }
//     catch(err) {
//         console.log(err);
//     }
// })();

// function saveFoto(foto, idFile) {

//     if(foto && idFile) {
//         fs.createReadStream(foto.path).
//             pipe(bucket.openUploadStream(foto.filename, {
//                 chunkSizeBytes: 1048576,
//                 contentType: foto.mimetype,
//                 id: new ObjectId(idFile),
//             }));
//     }
// }

// async function loadFoto (value, database) {
//     const { db } = mongoose.connection;

//     const dbImages = await db.collection("files.chunks").findOne({files_id : new ObjectId(database)});

//     console.log(dbImages);
    
//     return dbImages;
// }

async function deleteFoto (value) {
    if(value._id){
        //bucket.delete(new ObjectId(value._id));
        fs.unlink(`${__basedir}/assets/uploads/${value.data}`, (err) => {
            if (err) {
                console.error('Error deleting file:', err);
            }
            console.log('File deleted successfully');
        });
    }
}

// function updateFoto (value, idFile, newId) {

//     if(idFile)
//     {
//         bucket.delete(new ObjectId(idFile));
//     }

//     saveFoto(value, newId);
// }

module.exports = { deleteFoto }