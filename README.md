# AWS_LocalStack_Dashboard
This project is a LocalStack-based AWS architecture that simulates a cloud environment for development and testing. It includes the following components:

## Backend:
- S3 Bucket: Used for file storage.
- DynamoDB Table: Stores metadata for files uploaded to S3.
- Lambda Function: Triggered by S3 events (e.g., file upload or deletion) to update the DynamoDB table.
- Express Server: Provides APIs for file upload, listing, and management. Located in server.js.
## Frontend:
- React + Vite: A minimal React-based frontend for interacting with the backend APIs. Configured with TailwindCSS for styling. Located in src.

## LocalStack:
- Dockerized LocalStack: Simulates AWS services (S3, Lambda, DynamoDB, IAM) locally. Configured via docker-compose.yml.
- Lambda Function Code: Written in Python (LocalStack/lambda/lambda_function.py) to handle S3 events and update DynamoDB.
### Key Features:
- File Upload: Files are uploaded to S3 via the backend API.
- Metadata Management: File metadata is stored in DynamoDB and updated automatically via Lambda triggers.
- Local Development: Uses LocalStack to avoid real AWS costs during development.

### Setup:
- Backend: Start the server using npm start or npm run dev in the backend directory.
- Frontend: Run npm run dev in the frontend directory to start the React app.
- LocalStack: Use Docker Compose to start LocalStack and configure AWS services using the commands in cmd.txt. or setup.ps1 in LocalStack\lambda\setup.ps1

### LocalStack S3 + Lambda + DynamoDB Setup
PATH : LocalStack\lambda\setup.ps1

This script sets up a sample AWS architecture using **LocalStack** that includes:
- An S3 bucket for file storage
- A DynamoDB table for metadata
- A Lambda function triggered by S3 events
- An IAM role with necessary permissions

## Prerequisites

- PowerShell
- Node.js installed
- AWS CLI installed and configured
- LocalStack running (Docker or Docker Compose)
- `function.zip` (contains your Lambda function code)
- LocalStack accessible at `http://localhost:4566`