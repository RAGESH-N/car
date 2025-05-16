const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/signupDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Schema and Model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true, match: /^\d{10}$/, unique: true },
  email: { 
    type: String, 
    required: true, 
    match: /^[a-zA-Z0-9._%+-]+@gmail\.com$/, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true, 
    match: /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,12}$/,
  },
  favourites: { type: String, default: "" } // favourites as string
});
const User = mongoose.model('User', userSchema);

// Signup Endpoint
app.post('/signup', async (req, res) => {
  const { name, mobile, email, password, favourites } = req.body;

  if (!name || !mobile || !email || !password || !favourites) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Email or Mobile number already exists' });
    }

    const newUser = new User({ 
      name, 
      mobile, 
      email, 
      password, 
      favourites: favourites 
    });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Login Endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Both email and password are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (password !== user.password) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    res.status(200).json({ 
      message: 'Login successful', 
      user: { 
        name: user.name, 
        email: user.email
        // favourites not included in login response
      } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});
// ... [rest of your server.js above] ...

// Change Password Endpoint
app.post('/change-password', async (req, res) => {
  const { email, currentPassword, newpassword } = req.body;
  if (!email || !currentPassword || !newpassword) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.password !== currentPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    // Validate new password against schema pattern:
    const pattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,12}$/;
    if (!pattern.test(newpassword)) {
      return res.status(400).json({ error: 'New password does not meet criteria' });
    }

    user.password = newpassword;
    await user.save();
    res.status(200).json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});
// ... existing code above

// Forget Password Endpoint
app.post('/forget-password', async (req, res) => {
  const { email, newpassword, favourites } = req.body;
  if (!email || !newpassword) {
    return res.status(400).json({ error: 'Email and new password are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Validate new password against schema pattern:
    const pattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,12}$/;
    if (!pattern.test(newpassword)) {
      return res.status(400).json({ error: 'New password does not meet criteria' });
    }

    user.password = newpassword;
    // Update favourites if provided
    if (typeof favourites === 'string') {
      user.favourites = favourites;
    }
    await user.save();
    res.status(200).json({ message: 'Password reset successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});


// Admin Schema and Model (new)
const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const Admin = mongoose.model('Admin', adminSchema);

// Admin Login Endpoint
app.post('/admin-login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Both fields are required' });
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ error: 'Admin not found' });
    if (admin.password !== password) return res.status(401).json({ error: 'Invalid password' });
    res.status(200).json({ message: 'Login successful', admin: { email: admin.email } });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});