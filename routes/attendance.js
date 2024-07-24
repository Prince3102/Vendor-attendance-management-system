const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');

// Middleware to check if user is logged in
function isLoggedIn(req, res, next) {
  if (req.session.isLoggedIn) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
}
// Apply isLoggedIn middleware to all routes
router.use(isLoggedIn);

// Submit attendance
router.post('/submit', async (req, res) => {
  try {
    const { date, department, attendanceData } = req.body;
    console.log('Received attendance data:', { date, department, attendanceData });
    
    const attendanceRecords = attendanceData.map(record => ({
      date: new Date(date),
      department,
      vendorId: record.vendorId,
      present: record.present,
    }));

    const result = await Attendance.insertMany(attendanceRecords);
    console.log('Inserted records:', result);

    res.status(201).json({ message: 'Attendance submitted successfully' });
  } catch (error) {
    console.error('Error submitting attendance:', error);
    res.status(500).json({ message: 'Error submitting attendance', error: error.message });
  }
});

// Fetch attendance
router.get('/fetch', async (req, res) => {
  try {
    const { date, department } = req.query;
    console.log('Fetching attendance for:', { date, department });
    
    const attendance = await Attendance.find({
      date: new Date(date),
      department,
    });
    console.log('Fetched attendance:', attendance);
    
    res.status(200).json(attendance);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ message: 'Error fetching attendance', error: error.message });
  }
});

module.exports = router;