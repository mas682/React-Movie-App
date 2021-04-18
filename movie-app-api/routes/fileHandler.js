// to read files
//const fs = require('fs');
// to handle communicating with AWS
const config = require('../Config.json');
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
import FileUploadError from '../src/FileUploadError.js';
import { nanoid } from 'nanoid/async'
import models, {sequelize} from '../src/models';

const s3Bucket = new AWS.S3({
    accessKeyId: config.aws.AWS_ACCESS_KEY_ID,
    secretAccessKey: config.aws.AWS_Secret_KEY,
    Bucket: config.aws.bucketName
});

/* to store locally
const storage = multer.diskStorage({
    // store the file in the uploads folder
    destination: function(req, file, cb) {
        cb(null, 'uploads')
    },
    // use the files original name
    filename: async function(req, file, cb) {
        //cb(null, file.originalname)
        // need to extract file extension
        // also get requesting user id
        //
        console.log(await nanoid());
        cb(null, "testfile.jpg")
    }
});
*/

// function to create where to store the image in the s3 storage bucket
const storage = multerS3({
    s3: s3Bucket,
    bucket: config.aws.bucketName,
    key: async function (req, file, cb) {
        let fileExt = file.originalname.split(".")[1];
        fileExt = fileExt.toLowerCase();
        let filename;
        let nameInUse;
        let counter = 0;
        do {
            filename = await nanoid();
            filename = filename + "." + fileExt;
            try
            {
                nameInUse = await models.User.hasPictureFileName(filename);
            }
            catch(err)
            {
                let errorObject = JSON.parse(JSON.stringify(err));
                console.log("Some unexpected error occurred trying to see if the file name: " + filename +
                " was in use for a user profile picture");
                console.log(errorObject);
                cb(err, false);
                return;
            }
            counter = counter + 1;
        } while (counter < 5 && nameInUse);

        if(counter >= 5 && nameInUse)
        {
            return cb(new FileUploadError("SERVER_FILE_NAME_GENERATION_ERROR"), false);
        }
        else
        {
            cb(null, filename);
        }
    }
});


// function to help validate the file sent in the request
function fileFilter(req, file, cb) {
    if(file.originalname.length > 100 || file.originalname.length < 5)
    {
        req.fileValidationError = 'File name cannot be greater than 100 characters';
        return cb(new FileUploadError("INVALID_FILE_NAME_LENGTH"), false);
    }
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
        req.fileValidationError = 'Invalid file type';
        return cb(new FileUploadError("INVALID_FILE_TYPE"), false);
    }
    else if(!file.mimetype.startsWith('image/'))
    {
        req.fileValidationError = 'Invalid file type';
        return cb(new FileUploadError("INVALID_FILE_TYPE"), false);
    }
    cb(null, true);
};

// function to handle incoming file from post request
var imageUpload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024000,
        files: 1
    }
}).single('file');

const imageHandler = async(req, res, next) => {
    imageUpload(req, res,function(err) {
        if(!err)
        {
            next();
        }
        else
        {
            let status;
            let message;
            let requester = res.locals.requester;
            let errorObject = JSON.parse(JSON.stringify(err));
            if(errorObject.name === 'MulterError')
            {
                status = 400;
                if(errorObject.message === 'File too large')
                {
                    // need to resize pictures to 100kb or less...
                    // consider jimp library or sharp along with multers3 transform
                    message = "The provided file is too large(max size: )";
                }
                else if(errorObject.message === 'Unexpected File')
                {
                    // this means 'file' key not used in request
                    message = "The file could not be found in the request";

                }
                else if(errorObject.message === 'Too many files')
                {
                    message = "Only 1 image can be sent in the request";
                }
                else
                {
                    status = 500;
                    message = "Some unexpected error occurred on the server";
                    console.log(message + " when a user was uploading a image");
                    console.log(errorObject);
                }

            }
            else if(errorObject.name === 'FileUploadError')
            {
                if(errorObject.message === 'Invalid file type')
                {
                    status = 400;
                    message = errorObject.message;
                }
                else if(errorObject.code === 'INVALID_FILE_NAME_LENGTH')
                {
                    status = 400;
                    message = errorObject.message;
                }
                else if(errorObject.code === 'SERVER_FILE_NAME_GENERATION_ERROR')
                {
                    // could not find a unique file name
                    status = 500;
                    message = "Some unexpected error occurred on the server";
                }
                else
                {
                    status = 500;
                    message = "Some unexpected error occurred on the server";
                    console.log(message + " when a user was uploading a image");
                    console.log(errorObject);
                }
            }
            else
            {
                if(errorObject.code === 'InvalidAccessKeyId')
                {
                    status = 500;
                    message = "Some unexpected error occurred on the server";
                    console.log("Sever error: s3 access key invalid");
                    console.log(errorObject);
                }
                else if(errorObject.code === 'SignatureDoesNotMatch')
                {
                    status = 500;
                    message = "Some unexpected error occurred on the server";
                    console.log("Sever error: s3 signature does not match");
                    console.log(errorObject);
                }
                else if(errorObject.code === 'NoSuchBucket')
                {
                    status = 500;
                    message = "Some unexpected error occurred on the server";
                    console.log("Sever error: s3 bucket " + config.aws.bucketName + " could not be found");
                    console.log(errorObject);
                }
                else
                {
                    status = 500;
                    message = "Some unexpected error occurred on the server";
                    console.log(message + " when a user was uploading a image");
                    console.log(errorObject);
                }

            }
            res.status(status).send({
                message: message,
                requester: requester
            });
        }
    });
}

const removeImage = async(filename) =>
{
    let params = {Bucket: config.aws.bucketName, Key: filename};
    try
    {
        s3Bucket.deleteObject(params, function(err, data) {
            if(err) {
                console.log("Error removing image from S3 bucket: " + filename);
                let errorObject = JSON.parse(JSON.stringify(err));
                console.log(errorObject);
            }
            else
            {
                console.log("Successfully removed image from the bucket or the image did not exist");
                // {} on successful removal
            }
        });
    }
    catch(err)
    {
        console.log("Error removing image from S3 bucket: " + filename);
        let errorObject = JSON.parse(JSON.stringify(err));
        console.log(errorObject);
    }
};

export {imageHandler, imageUpload, removeImage}
