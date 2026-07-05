const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Company name is required'],
            trim: true,
        },
        gstNumber: {
            type: String,
            required: [true, 'GST number is required'],
            uppercase: true,
        },
        address: {
            street: { type: String, trim: true },
            city: { type: String, trim: true },
            state: { type: String, trim: true },
            pincode: { type: String, trim: true },
        },
        phone: { type: String, trim: true },
        email: { type: String, trim: true, lowercase: true },
        financialYearStart: {
            type: Date,
            default: () => new Date(new Date().getFullYear(), 3, 1), // April 1
        },
        financialYearEnd: {
            type: Date,
            default: () => new Date(new Date().getFullYear() + 1, 2, 31), // March 31
        },
        logo: { type: String },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Company', companySchema);
