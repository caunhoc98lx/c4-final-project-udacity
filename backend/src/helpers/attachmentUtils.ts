import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})
const logger = createLogger('attachmentUtils')

// TODO: Implement the fileStogare logic
const bucketName = process.env.ATTACHMENT_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export async function getUploadUrl(imageId: string): Promise<string> {
  return await s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: imageId,
    Expires: parseInt(urlExpiration)
  })
}

export function generateAttachmentURL(imageId: string) {
  return `https://${bucketName}.s3.amazonaws.com/${imageId}`
}

export async function deleteAttachmentImage(imageId: string) {
  try {
    await s3.deleteObject({ Bucket: bucketName, Key: imageId }).promise()
    logger.info(`Deleted object: s3://${bucketName}/${imageId}`)
    return
  } catch (error) {
    logger.error(`Error deleting object: s3://${bucketName}/${imageId}`, error)
    throw error
  }
}

export default {
  deleteAttachmentImage,
  getUploadUrl,
  generateAttachmentURL
}
