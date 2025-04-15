import boto3
import os
import json
from urllib.parse import unquote_plus

# LocalStack endpoint setup
localstack_host = os.environ.get("LOCALSTACK_HOSTNAME", "localhost")
edge_port = os.environ.get("EDGE_PORT", "4566")
endpoint_url = f"http://{localstack_host}:{edge_port}"

# Setup AWS clients
s3 = boto3.client(
    "s3",
    endpoint_url=endpoint_url,
    aws_access_key_id="test",
    aws_secret_access_key="test",
    region_name="ap-south-1"
)

dynamodb = boto3.resource(
    "dynamodb",
    endpoint_url=endpoint_url,
    aws_access_key_id="test",
    aws_secret_access_key="test",
    region_name="ap-south-1"
)

table = dynamodb.Table("FileMetadata")

def handler(event, context):
    print("Event: ", json.dumps(event, indent=2))
    for record in event["Records"]:
        bucket = record["s3"]["bucket"]["name"]
        key = unquote_plus(record["s3"]["object"]["key"])
        event_name = record["eventName"]

        if event_name.startswith("ObjectCreated"):
            # Upload event - store metadata
            response = s3.head_object(Bucket=bucket, Key=key)
            metadata = {
                "FileName": key,
                "Size": response["ContentLength"],
                "UploadDate": response["LastModified"].isoformat()
            }
            table.put_item(Item=metadata)
            print(f"File '{key}' uploaded and metadata saved.")

        elif event_name.startswith("ObjectRemoved"):
            # Delete event - remove from DynamoDB
            table.delete_item(Key={"FileName": key})
            print(f"File '{key}' deleted from S3. Metadata removed.")

    return {
        "statusCode": 200,
        "body": json.dumps("Metadata processed successfully.")
    }
