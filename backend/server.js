const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const s3 = require('./s3');
const dynamodb = require('./dynamodb');
const cors = require('cors'); 
const { console } = require('inspector');
require('dotenv').config();

const app = express();
const PORT = 5000;
const upload = multer({ dest: 'uploads/' });
const BUCKET = process.env.BUCKET_NAME;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'uploads')));
app.use(cors()); // Enable CORS for all routes

// Upload file to S3
app.post('/upload', upload.single('file'), async (req, res) => {
  const fileContent = fs.readFileSync(req.file.path);
  const params = {
    Bucket: BUCKET,
    Key: req.file.originalname,
    Body: fileContent,
  };

  try {
    await s3.upload(params).promise();
    fs.unlinkSync(req.file.path); // remove from local
    res.send({ message: 'File uploaded to S3.' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Upload failed.');
  }
});

// List all files in S3 bucket
app.get('/files', async (req, res) => {
  const params = { Bucket: BUCKET };
  try {
    const data = await dynamodb.scan({TableName: 'FileMetadata'}).promise();
    /* const data = await s3.listObjectsV2(params).promise();
    const filenames = data.Contents.map((item) => item.Key);
    const fileSizes = data.Contents.map((item) => item.Size);
    const fileDates = data.Contents.map((item) => item.LastModified);
    const fileDetails = filenames.map((filename, index) => {
      return {
        filename,
        size: fileSizes[index],
        date: fileDates[index],
      };
    }); */
    res.json(data.Items);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to list files.');
  }
});

// Get all buckets
app.get('/buckets', async (req, res) => {
  try {
    const data = await s3.listBuckets().promise();

    data.Buckets.forEach((bucket) => {
      console.log(`Bucket Name: ${bucket.Name}, Created At: ${bucket.CreationDate}`);
    });
    // Log the bucket names and creation dates
    // console.log('Bucket Names:', data.Buckets.map(bucket => bucket.Name));
    // console.log('Creation Dates:', data.Buckets.map(bucket => bucket.CreationDate));
    console.log('Buckets:', data);
    const buckets = data.Buckets.map(bucket => ({
      name: bucket.Name,
      createdAt: bucket.CreationDate
    }));
    res.json(buckets);
  } catch (err) {
    console.error('Error listing buckets:', err);
    res.status(500).json({ error: 'Failed to list S3 buckets' });
  }
});

app.post('/buckets/createbucket', async (req, res) => {
  const bucketName = req.body.bucketName; // Get the bucket name from body parameters
  if (!bucketName) {
    return res.status(400).send('Bucket name is required.');
  }
  // Check if the bucket already exists 
  const existingBuckets = await s3.listBuckets().promise();
  const bucketExists = existingBuckets.Buckets.some(bucket => bucket.Name === bucketName);
  if (bucketExists) { 
    return res.status(400).send(`Bucket ${bucketName} already exists.`);
  } 
  // Create the bucket
  const params = {
    Bucket: bucketName, 
  };

  try {
    await s3.createBucket(params).promise();
    res.send(`Bucket ${bucketName} created.`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Bucket creation failed.');
  }
});

app.get('/buckets/:bucketName/files', async (req, res) => {
  const bucketName = req.params.bucketName;
  const params = { Bucket: bucketName };

  try {
    const data = await s3.listObjectsV2(params).promise();
    const fileDetails = data.Contents.map((item) => ({
      filename: item.Key,
      size: item.Size,
      date: item.LastModified,
    }));
    res.json(fileDetails);
  } catch (err) {
    console.error(`Failed to list files in bucket ${bucketName}:`, err);
    res.status(500).send(`Failed to list files in bucket ${bucketName}`);
  }
});

// Download file by name
app.get('/download/:filename', async (req, res) => {
  const params = {
    Bucket: BUCKET,
    Key: req.params.filename,
  };

  try {
    const data = await s3.getObject(params).promise();
    res.setHeader('Content-Disposition', `attachment; filename=${req.params.filename}`);
    res.send(data.Body);
  } catch (err) {
    console.error(err);
    res.status(500).send('Download failed.');
  }
});
// Download file by name
app.delete('/delete/:filename', async (req, res) => {
  
  const deleteParams = {
    Bucket: BUCKET,
    Key: req.params.filename,
  };
  console.log('Delete Params:', deleteParams);
  try {
    await s3.deleteObject(deleteParams).promise();
    res.send({ message: 'File deleted from S3.' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Delete failed.');
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
