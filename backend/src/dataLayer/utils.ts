import { Key } from "aws-sdk/clients/dynamodb";

export function decodeLastEvaluatedKey(
  lastEvaluatedKey: string | undefined
): Key | undefined {
  if (lastEvaluatedKey === undefined || lastEvaluatedKey.trim().length === 0) {
    return undefined;
  }
  if (!isValidBase64(lastEvaluatedKey)) {
    throw new Error("Invalid last key value");
  }
  const decodedLastKey: string = Buffer.from(
    lastEvaluatedKey,
    "base64"
  ).toString("utf-8");
  try {
    return JSON.parse(decodedLastKey) as Key;
  } catch (error) {
    throw new Error("Invalid last key value");
  }
}

export function encodeLastEvaluatedKey(
  lastKey: Key | undefined
): string | undefined {
  if (lastKey === undefined) {
    return lastKey;
  }
  return Buffer.from(JSON.stringify(lastKey)).toString("base64");
}

function isValidBase64(value: string): boolean {
  const base64Regex = /^[A-Za-z0-9+/]+(?:=|==)?$/;

  return base64Regex.test(value);
}
