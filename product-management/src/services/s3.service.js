const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");

const aws = require("../config/aws");
const { v4: uuidv4 } = require("uuid");

const s3 = new S3Client({
  region: aws.region,
  credentials: aws.credentials,
});

function buildPublicUrl(key) {
  return `https://${aws.bucketName}.s3.${aws.region}.amazonaws.com/${key}`;
}

async function uploadImage(file) {
  const ext = (file.originalname.split(".").pop() || "jpg").toLowerCase();
  const key = `products/${uuidv4()}.${ext}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: aws.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      // Nếu bucket public bằng policy thì KHÔNG cần ACL
      // ACL: "public-read",
    })
  );

  return { key, url: buildPublicUrl(key) };
}

async function deleteImageByKey(key) {
  if (!key) return;

  await s3.send(
    new DeleteObjectCommand({
      Bucket: aws.bucketName,
      Key: key,
    })
  );
}

// Tách key từ URL S3
function extractKeyFromUrl(url) {
  if (!url) return null;
  const idx = url.indexOf(".amazonaws.com/");
  if (idx === -1) return null;
  return url.substring(idx + ".amazonaws.com/".length + 1);
}

module.exports = {
  uploadImage,
  deleteImageByKey,
  extractKeyFromUrl,
};
