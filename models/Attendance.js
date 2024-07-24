const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  department: { type: String, required: true },
  vendorId: { type: String, required: true },
  present: { type: Boolean, required: true },
});

module.exports = mongoose.model('Attendance', AttendanceSchema);