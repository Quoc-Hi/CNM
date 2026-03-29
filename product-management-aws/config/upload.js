const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

const s3Params = {
    region: process.env.AWS_REGION || 'us-east-1'
};
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    s3Params.credentials = {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    };
}
const s3 = new S3Client(s3Params);

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ chấp nhận upload file ảnh!'), false);
    }
};

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: () => process.env.S3_BUCKET_NAME || 'my-bucket',
        // Note: setting acl strictly depends on bucket 'Object Ownership' settings. Omitting default acl.
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            // Replace spaces with underscores to avoid URL encoding issues
            const safeName = file.originalname.replace(/\s+/g, '_');
            cb(null, 'products/' + uniqueSuffix + '-' + safeName);
        }
    }),
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB max size
});

const deleteImageFromS3 = async (imageUrl) => {
    if (!imageUrl) return false;
    try {
        // Extract S3 object key from the url
        // URL format: https://bucket-name.s3.region.amazonaws.com/products/...
        const urlObj = new URL(imageUrl);
        let key = urlObj.pathname.startsWith('/') ? urlObj.pathname.substring(1) : urlObj.pathname;
        const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: decodeURIComponent(key)
        };
        await s3.send(new DeleteObjectCommand(params));
        return true;
    } catch (err) {
        console.error("Error deleting old image from S3:", err);
        return false;
    }
};

module.exports = { upload, deleteImageFromS3 };
