// to read files
const fs = require('fs');
// to handle communicating with AWS
const AWS = require('aws-sdk');
const config = require('../Config.json');
const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
    // store the file in the uploads folder
    destination: function(req, file, cb) {
        cb(null, 'uploads')
    },
    // use the files original name
    filename: function(req, file, cb) {
        cb(null, file.originalname)
    }
});

// holds the storage object
var uploads = multer({ storage });



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



// test function
const imageHandler = async(req, res) => {
    //uploadImageHandler(req, res);
    uploads.single('file');
    // find the directory
    const uploadsDir = path.join('uploads');
    fs.readdir(uploadsDir, (err, files) => {
        if(err)
        {
            console.log({msg: err});
        }
        if(files.length === 0)
        {
            console.log({msg: 'No Images Uploaded!'});
        }
        else
        {
            console.log(files);
        }
    });
}

const uploadImageHandler = async(req, res) => {
    uploads(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
        } else if (err) {
            // An unknown error occurred when uploading.
        }
        // everything is good
        // req.file
    });

}


const imageFilter = function(req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
        req.fileValidationError = 'Only image files are allowed!';
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

export {imageHandler, uploads}
