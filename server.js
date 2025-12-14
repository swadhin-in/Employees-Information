// server.js updates
require('dotenv').config(); // Load .env file
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const Member = require('./models/Member');

//updated server.js with admin auth dependencies
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('./models/Admin');
const JWT_SECRET = "super_secret_key_change_this_in_prod"; // Store in .env in real app

// 1. Import Cloudinary & Multer
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

const app = express();
app.use(express.json());
app.use(cors());

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.header('auth-token');
  if (!token) return res.status(401).send('Access Denied');

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next(); // Pass them through to the route
  } catch (err) {
    res.status(400).send('Invalid Token');
  }
};


// 2. Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 3. Configure Storage Engine
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'member_cards', // The folder name in your Cloudinary account
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

const upload = multer({ storage: storage });

// 4. UPDATED: Create Member Route with File Upload
// We use 'upload.single("photo")' middleware to process the file first
app.post('/api/members', verifyToken, upload.single('photo'), async (req, res) => {
  try {
    // req.file contains the file info from Cloudinary
    // req.body contains the text fields (name, domain, etc.)

    const photoUrl = req.file ? req.file.path : null; // Get the Cloudinary URL

    const newMember = new Member({
      name: req.body.name,
      domain: req.body.domain,
      phone: req.body.phone,
      email: req.body.email,
      photoUrl: photoUrl, // Save the URL to MongoDB
      uniqueId: uuidv4()
    });

    await newMember.save();
    res.status(201).json(newMember);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create member" });
  }
});

// ... Keep your other GET/DELETE routes the same ...

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("DB Connected"))
  .catch(err => console.log(err));

// app.listen(5000, () => console.log("Server running on port 5000"));

const PORT = process.env.PORT || 5000; // Use environment variable
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// 1. REGISTER (Run this once via Postman/Curl to create your admin, then delete/comment out)
app.post('/api/register', async (req, res) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  const admin = new Admin({
    username: req.body.username,
    password: hashedPassword
  });

  try {
    const savedAdmin = await admin.save();
    res.send({ user: savedAdmin._id });
  } catch (err) { res.status(400).send(err); }
});

// 2. LOGIN (This gives the frontend the Token)
app.post('/api/login', async (req, res) => {
  // Check if user exists
  const admin = await Admin.findOne({ username: req.body.username });
  if (!admin) return res.status(400).send('Username is wrong');

  // Check password
  const validPass = await bcrypt.compare(req.body.password, admin.password);
  if (!validPass) return res.status(400).send('Invalid password');

  // Create and assign token
  const token = jwt.sign({ _id: admin._id }, JWT_SECRET);
  res.header('auth-token', token).send({ token });
});
// 3. DELETE MEMBER (Protected Route)

app.delete('/api/members/:id', verifyToken, async (req, res) => {
  try {
    const deletedMember = await Member.findByIdAndDelete(req.params.id);

    if (!deletedMember) {
      return res.status(404).json({ msg: 'Member not found' });
    }

    // If found and deleted, send success message
    res.json({ msg: 'Member deleted' });

  } catch (err) {
    // Log the error for debugging purposes
    console.error(err.message);
    res.status(500).send('Server error');
  }
});
