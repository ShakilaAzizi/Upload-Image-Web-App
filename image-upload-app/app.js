const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

let uploads = [];
const dataFile = 'uploads.json';

if (fs.existsSync(dataFile)) {
  uploads = JSON.parse(fs.readFileSync(dataFile));
}

app.get('/', (req, res) => {
  const latestUpload = uploads[uploads.length - 1];
  res.render('index', { latest: latestUpload });
});

app.get('/upload', (req, res) => {
  res.render('upload');
});

app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.send('No file uploaded!');

  const newUpload = {
    filename: req.file.filename,
    originalname: req.file.originalname,
    date: new Date().toLocaleString()
  };

  uploads.push(newUpload);
  fs.writeFileSync(dataFile, JSON.stringify(uploads, null, 2));

  res.redirect('/');
});

app.get('/gallery', (req, res) => {
  res.render('gallery', { uploads });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
