const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const s3 = require('./s3');
const cors = require('cors'); 
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
    const data = await s3.listObjectsV2(params).promise();
    const filenames = data.Contents.map((item) => item.Key);
    const fileSizes = data.Contents.map((item) => item.Size);
    const fileDates = data.Contents.map((item) => item.LastModified);
    const fileDetails = filenames.map((filename, index) => {
      return {
        filename,
        size: fileSizes[index],
        date: fileDates[index],
      };
    });
    res.json(fileDetails);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to list files.');
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

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
