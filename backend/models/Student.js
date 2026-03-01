const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true, minlength: [3, 'Name must be at least 3 characters'] },
  registerNumber: { type: String, required: [true, 'Register number is required'], unique: true, trim: true, uppercase: true },
  department: { type: String, required: [true, 'Department is required'], trim: true },
  email: { type: String, required: [true, 'Email is required'], unique: true, trim: true, lowercase: true },
  password: { type: String, required: [true, 'Password is required'], minlength: [6, 'Password must be at least 6 characters'], select: false },
  faceImage: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

studentSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

studentSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

studentSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('Student', studentSchema);