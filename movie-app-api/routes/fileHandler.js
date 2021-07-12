;// to handle communicating with AWS
const config = require('../Config.json');
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3-transform');
const sharp = require('sharp');
import FileUploadError from '../src/FileUploadError.js';
import { nanoid } from 'nanoid/async'
const models = require('../src/sequelize.js').getClient().models;

const s3Bucket = new AWS.S3({
    accessKeyId: config.aws.AWS_ACCESS_KEY_ID,
    secretAccessKey: config.aws.AWS_Secret_KEY,
    Bucket: config.aws.bucketName
});

// function to create where to store the image in the s3 storage bucket
const storage = multerS3({
    s3: s3Bucket,
    bucket: config.aws.bucketName,
    shouldTransform: function(req, file, cb) {
        cb(null, true);
    },
    transforms: [
        {
            id: 'original',
            key: async function(req, file, cb, res) {
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
                        nameInUse = await models.Users.hasPictureFileName(filename);
                    }
                    catch(err)
                    {
                        let errorObject = JSON.parse(JSON.stringify(err));
                        console.log("(Error code: 1707) Some unexpected error occurred trying to see if the file name: " + filename +
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
                    req.locals = {filename:filename};
                    cb(null, "UserPictures/" + filename);
                }
            },
            transform: function(req, file, cb) {
                let type = file.mimetype.toLowerCase();
                if(type === 'image/jpeg' || type === 'image/jpg')
                {
                    cb(null, sharp().resize(800, 800).jpeg());
                }
                else if(type === 'image/png')
                {
                    cb(null, sharp().resize(800, 800).png());
                }
                else if(type === 'image/png')
                {
                    cb(null, sharp().resize(800, 800).gif());
                }
                else
                {
                    cb(new FileUploadError("INVALID_FILE_TYPE"), false);
                }
            }
        }
    ]
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
        fileSize: 12288000,
        files: 1
    }
}).single('file');

const imageHandler = async(req, res, next) => {
    res.locals.file = "fileHandler";
    res.locals.function = "imageHandler";
    imageUpload(req, res,function(err) {
        if(!err)
        {
            next();
        }
        else
        {
            next(err);
        }
    });
}

const removeImage = async(filename) =>
{
    let params = {Bucket: config.aws.bucketName, Key: "UserPictures/" + filename};
    try
    {
        let counter = 0;
        await s3Bucket.deleteObject(params).promise();
        return true;
    }
    catch(err)
    {
        console.log("(Error code: 1706) Error removing image from S3 bucket: " + filename);
        let errorObject = JSON.parse(JSON.stringify(err));
        // may need some additional error catching here to get more insight into this
        console.log(errorObject);
        return false;
    }
};

export {imageHandler, imageUpload, removeImage}
