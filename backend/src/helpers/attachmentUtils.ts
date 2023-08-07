import AWS from "aws-sdk";
import AWSXRay from "aws-xray-sdk";

// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const XAWS = AWSXRay.captureAWS(AWS);

// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const s3 = new XAWS.S3({
  signatureVersion: "v4",
});

export class AttachmentUtils {
  private readonly bucketName: string;
  private readonly urlExpiration: string;

  constructor() {
    this.bucketName = process.env?.ATTACHMENT_S3_BUCKET ?? "";
    this.urlExpiration = process.env?.SIGNED_URL_EXPIRATION ?? "";
  }

  getUploadUrl(id: string): string {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    return s3.getSignedUrl("putObject", {
      Bucket: this.bucketName,
      Key: id,
      Expires: this.urlExpiration,
    }) as string;
  }
}
