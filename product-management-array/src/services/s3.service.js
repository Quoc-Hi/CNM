/**
 * S3 Service
 * ==========
 * Handles image upload/delete to AWS S3
 */

const {
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} = require('@aws-sdk/client-s3');
const { s3Client } = require('../config/aws');

class S3Service {
  /**
   * Upload image to S3
   * @param {Buffer} fileBuffer - File buffer from upload
   * @param {String} fileName - Original filename
   * @param {String} mimeType - File MIME type
   * @returns {Promise<String>} S3 object key/URL
   */
  async uploadImage(fileBuffer, fileName, mimeType) {
    const bucketName = process.env.S3_BUCKET_NAME || 'product-management-images';

    // Generate unique key
    const timestamp = Date.now();
    const key = `products/${timestamp}-${fileName}`;

    const params = {
      Bucket: bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: mimeType,
      ACL: 'public-read', // Make it publicly readable
    };

    try {
      await s3Client.send(new PutObjectCommand(params));

      // Return the S3 object key (you can construct full URL if needed)
      return key;
    } catch (error) {
      console.error('S3 upload error:', error);
      throw new Error('Failed to upload image to S3');
    }
  }

  /**
   * Delete image from S3
   * @param {String} key - S3 object key
   * @returns {Promise<void>}
   */
  async deleteImage(key) {
    const bucketName = process.env.S3_BUCKET_NAME || 'product-management-images';

    if (!key) {
      return; // No image to delete
    }

    const params = {
      Bucket: bucketName,
      Key: key,
    };

    try {
      await s3Client.send(new DeleteObjectCommand(params));
    } catch (error) {
      console.error('S3 delete error:', error);
      throw new Error('Failed to delete image from S3');
    }
  }

  /**
   * Get image URL from S3
   * @param {String} key - S3 object key
   * @returns {String} Public URL
   */
  getImageUrl(key) {
    const bucketName = process.env.S3_BUCKET_NAME || 'product-management-images';
    const region = process.env.AWS_REGION || 'us-east-1';

    return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
  }
}

module.exports = new S3Service();
