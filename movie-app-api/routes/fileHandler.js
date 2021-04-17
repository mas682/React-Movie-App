// to read files
const fs = require('fs');
// to handle communicating with AWS
const AWS = require('aws-sdk');
const config = require('../Config.json');
const path = require('path');
const multer = require('multer');
const multerS3 = require('multer-s3');
import FileUploadError from '../src/FileUploadError.js';
import { nanoid } from 'nanoid/async'

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
      // need to extract file extension
      // also get requesting user id
      console.log(await nanoid());
      // need to verify that the nanoid does not exist
      // query user table to check file names
      cb(null, "Test.jpg");
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


/* keep until you do file deletion from aws
// sample on connect to aws to store files
const imageHandler2 = async() => {
    const s3Bucket = new AWS.S3({
        accessKeyId: config.aws.AWS_ACCESS_KEY_ID,
        secretAccessKey: config.aws.AWS_Secret_KEY,
        Bucket: config.aws.bucketName
    });
    fs.readFile('TestImg.jpg', function (err, data) {
        if(err) {throw err;}
        let params = {Bucket: config.aws.bucketName, Key: 'Test.jpg', Body: data};
        s3Bucket.putObject(params, function(err, data) {
            if(err) {
                console.log(err);
            }
            else
            {
                console.log("Successfully uploaded data to the bucket");
            }
        });
    });
};
*/

const imageHandler = async(req, res, next) => {
    imageUpload(req, res,function(err) {
        if(!err)
        {
            next();
        }
        else
        {
            console.log("ERROR CAUGHT");
            console.log(err);
            let errorObject = JSON.parse(JSON.stringify(err));
            console.log(errorObject);
            // errors:
            /*
                note: can pass variables beteween middleware functions using res.locals
                
                // this error object may change if using multer s3?
                errorObject.name === 'MulterError'
                    errorObject.message === 'File too large'
                        -- determine what good file size should be
                    errorObject.message === 'Unexpected File'
                        -- this means 'file' not used in request
                    errorObject.message === 'Too many files'
                errorObject.name === 'FileUploadError'
                    errorObject.message === 'Invalid file type'
                    errorObject.code === "INVALID_FILE_NAME_LENGTH"
                also need errors for connecting/putting images on s3
                    errorObject.code === 'InvalidAccessKeyId'
                        -- can also read the message but don't return to user
                    errorObject.code === 'SignatureDoesNotMatch'
                        -- can also read the message but don't return to user
                    errorObject.code === 'NoSuchBucket'
            */
            res.status(400).send("Failed");
        }
    });
}

export {imageHandler, imageUpload}
