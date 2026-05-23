const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    logo: { type: String, default: '' },
    description: { type: String, default: '' },
    location: { type: String, required: true },
    city: { type: String, required: true, trim: true },
    foundedOn: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Company', companySchema);
