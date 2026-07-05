const Supplier = require('../models/Supplier');

// @desc    Get all suppliers
// @route   GET /api/suppliers
exports.getSuppliers = async (req, res, next) => {
    try {
        const { search, page = 1, limit = 20 } = req.query;
        let query = { company: req.user.company };

        if (search) {
            query.$or = [
                { companyName: { $regex: search, $options: 'i' } },
                { contactPerson: { $regex: search, $options: 'i' } },
            ];
        }

        const suppliers = await Supplier.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Supplier.countDocuments(query);

        res.json({
            success: true,
            data: suppliers,
            pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single supplier
// @route   GET /api/suppliers/:id
exports.getSupplier = async (req, res, next) => {
    try {
        const supplier = await Supplier.findOne({ _id: req.params.id, company: req.user.company });
        if (!supplier) {
            return res.status(404).json({ success: false, message: 'Supplier not found' });
        }
        res.json({ success: true, data: supplier });
    } catch (error) {
        next(error);
    }
};

// @desc    Create supplier
// @route   POST /api/suppliers
exports.createSupplier = async (req, res, next) => {
    try {
        const supplier = await Supplier.create({ ...req.body, company: req.user.company });
        res.status(201).json({ success: true, data: supplier });
    } catch (error) {
        next(error);
    }
};

// @desc    Update supplier
// @route   PUT /api/suppliers/:id
exports.updateSupplier = async (req, res, next) => {
    try {
        const supplier = await Supplier.findOneAndUpdate(
            { _id: req.params.id, company: req.user.company },
            req.body,
            { new: true, runValidators: true }
        );
        if (!supplier) {
            return res.status(404).json({ success: false, message: 'Supplier not found' });
        }
        res.json({ success: true, data: supplier });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete supplier
// @route   DELETE /api/suppliers/:id
exports.deleteSupplier = async (req, res, next) => {
    try {
        const supplier = await Supplier.findOneAndDelete({ _id: req.params.id, company: req.user.company });
        if (!supplier) {
            return res.status(404).json({ success: false, message: 'Supplier not found' });
        }
        res.json({ success: true, message: 'Supplier deleted' });
    } catch (error) {
        next(error);
    }
};
