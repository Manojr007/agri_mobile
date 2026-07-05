const User = require('../models/User');
const Company = require('../models/Company');
const { validationResult } = require('express-validator');

// @desc    Register user
// @route   POST /api/auth/register
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, role, companyName } = req.body;

        if (!companyName) {
            return res.status(400).json({ success: false, message: 'Company Name is required' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        let companyId;
        if (role === 'admin') {
            // Admin: Create the company
            const company = await Company.create({
                name: companyName,
                gstNumber: '22AAAAA0000A1Z5', // default placeholder
            });
            companyId = company._id;
        } else {
            // Staff: Map to existing company
            const existCompany = await Company.findOne({ name: { $regex: new RegExp(`^${companyName}$`, 'i') } });
            if (!existCompany) {
                return res.status(400).json({
                    success: false,
                    message: `Company "${companyName}" not found. Admin/Owner must register it first.`
                });
            }
            companyId = existCompany._id;
        }

        const user = await User.create({ name, email, password, role, company: companyId });
        const populatedUser = await User.findById(user._id).populate('company');
        const token = user.getSignedJwtToken();

        res.status(201).json({
            success: true,
            token,
            user: {
                id: populatedUser._id,
                name: populatedUser.name,
                email: populatedUser.email,
                role: populatedUser.role,
                company: populatedUser.company
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const populatedUser = await User.findById(user._id).populate('company');
        const token = user.getSignedJwtToken();

        res.json({
            success: true,
            token,
            user: {
                id: populatedUser._id,
                name: populatedUser.name,
                email: populatedUser.email,
                role: populatedUser.role,
                company: populatedUser.company
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).populate('company');
        res.json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};
