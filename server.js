const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const attendanceRoutes = require('./routes/attendance');
require('dotenv').config();




const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));



app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false, // Set to true if using https
    maxAge: 60000 // 60 seconds (1 minute)
  }
}));
// Connect to MongoDB
const MONGODB_URI = 'mongodb+srv://princesharma543215:8or9kHeLXi9iFGkh@attendance-management.p4tr7v9.mongodb.net/?retryWrites=true&w=majority&appName=attendance-management';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Error connecting to MongoDB:', err));

app.use('/api/attendance', attendanceRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


//Add a login route in server.js
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    req.session.isLoggedIn = true;
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});
app.get('/api/check-session', (req, res) => {
  res.json({ isLoggedIn: req.session.isLoggedIn || false });
});

//Logout route 
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.clearCookie('connect.sid'); // Clear the session cookie
    res.json({ success: true });
  });
});