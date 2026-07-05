const Company = require('../models/Company');

// @desc    Get company info
// @route   GET /api/company
exports.getCompany = async (req, res, next) => {
    try {
        if (!req.user || !req.user.company) {
            return res.status(400).json({ success: false, message: 'User is not associated with a company' });
        }
        let company = await Company.findById(req.user.company);
        if (!company) {
            // Fallback: create if it's missing for some reason
            company = await Company.create({
                _id: req.user.company,
                name: 'My AgriERP Company',
                gstNumber: '22AAAAA0000A1Z5',
                address: { city: 'Pune', state: 'Maharashtra' },
            });
        }
        res.json({ success: true, data: company });
    } catch (error) {
        next(error);
    }
};

// @desc    Update company info
// @route   PUT /api/company
exports.updateCompany = async (req, res, next) => {
    try {
        if (!req.user || !req.user.company) {
            return res.status(400).json({ success: false, message: 'User is not associated with a company' });
        }

        // Sanitize input: delete immutable/system keys to prevent MongoDB validation/casting errors
        const updates = { ...req.body };
        delete updates._id;
        delete updates.__v;
        delete updates.createdAt;
        delete updates.updatedAt;

        let company = await Company.findByIdAndUpdate(req.user.company, updates, {
            new: true,
            runValidators: true,
        });
        
        if (!company) {
            return res.status(404).json({ success: false, message: 'Company not found' });
        }
        
        res.json({ success: true, data: company });
    } catch (error) {
        next(error);
    }
};
