const Customer = require('../models/Customer');
const Sale = require('../models/Sale');

// @desc    Get all customers
// @route   GET /api/customers
exports.getCustomers = async (req, res, next) => {
    try {
        const { search, page = 1, limit = 20 } = req.query;
        let query = { company: req.user.company };

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { village: { $regex: search, $options: 'i' } },
            ];
        }

        const customers = await Customer.find(query)
             .sort({ createdAt: -1 })
             .skip((page - 1) * limit)
             .limit(parseInt(limit));

        const total = await Customer.countDocuments(query);

        res.json({
            success: true,
            data: customers,
            pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single customer
// @route   GET /api/customers/:id
exports.getCustomer = async (req, res, next) => {
    try {
        const customer = await Customer.findOne({ _id: req.params.id, company: req.user.company });
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }
        res.json({ success: true, data: customer });
    } catch (error) {
        next(error);
    }
};

// @desc    Create customer
// @route   POST /api/customers
exports.createCustomer = async (req, res, next) => {
    try {
        const customer = await Customer.create({ ...req.body, company: req.user.company });
        res.status(201).json({ success: true, data: customer });
    } catch (error) {
        next(error);
    }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
exports.updateCustomer = async (req, res, next) => {
    try {
        const customer = await Customer.findOneAndUpdate(
            { _id: req.params.id, company: req.user.company },
            req.body,
            { new: true, runValidators: true }
        );
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }
        res.json({ success: true, data: customer });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete customer
// @route   DELETE /api/customers/:id
exports.deleteCustomer = async (req, res, next) => {
    try {
        const customer = await Customer.findOneAndDelete({ _id: req.params.id, company: req.user.company });
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }
        res.json({ success: true, message: 'Customer deleted' });
    } catch (error) {
        next(error);
    }
};

// @desc    Get customer transaction history
// @route   GET /api/customers/:id/history
exports.getCustomerHistory = async (req, res, next) => {
    try {
        const customer = await Customer.findOne({ _id: req.params.id, company: req.user.company });
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        const sales = await Sale.find({ customer: req.params.id, company: req.user.company })
            .populate('items.product', 'name category')
            .sort({ saleDate: -1 });

        res.json({ success: true, data: { customer, transactions: sales } });
    } catch (error) {
        next(error);
    }
};
