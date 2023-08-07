import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})

export class AttachmentUtils {
  private readonly bucketName
  private readonly urlExpiration

  constructor() {
    this.bucketName = process.env.ATTACHMENT_S3_BUCKET
    this.urlExpiration = process.env.SIGNED_URL_EXPIRATION
  }

  getUploadUrl(id: string) {
    return s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: id,
      Expires: this.urlExpiration
    })
  }
}
