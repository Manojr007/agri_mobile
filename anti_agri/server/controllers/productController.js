const Product = require('../models/Product');
const Batch = require('../models/Batch');

// @desc    Get all products
// @route   GET /api/products
exports.getProducts = async (req, res, next) => {
    try {
        const { search, category, page = 1, limit = 20 } = req.query;
        let query = { company: req.user.company };

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } },
                { barcode: search },
            ];
        }
        if (category) query.category = category;

        const products = await Product.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Product.countDocuments(query);

        res.json({
            success: true,
            data: products,
            pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single product with batches
// @route   GET /api/products/:id
exports.getProduct = async (req, res, next) => {
    try {
        const product = await Product.findOne({ _id: req.params.id, company: req.user.company });
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const batches = await Batch.find({ product: req.params.id, quantity: { $gt: 0 }, company: req.user.company })
            .sort({ expiryDate: 1 });

        res.json({ success: true, data: { ...product.toObject(), batches } });
    } catch (error) {
        next(error);
    }
};

// @desc    Create product
// @route   POST /api/products
exports.createProduct = async (req, res, next) => {
    try {
        const product = await Product.create({ ...req.body, company: req.user.company });

        // If initial stock or price is provided, create an initial batch
        if (product.totalStock > 0 || product.purchasePrice > 0 || product.sellingPrice > 0) {
            await Batch.create({
                product: product._id,
                company: req.user.company,
                batchNumber: 'INITIAL',
                expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)), // Default 2 years expiry
                purchasePrice: product.purchasePrice || 0,
                sellingPrice: product.sellingPrice || 0,
                quantity: product.totalStock || 0,
                initialQuantity: product.totalStock || 0,
            });
        }

        res.status(201).json({ success: true, data: product });
    } catch (error) {
        next(error);
    }
};

// @desc    Update product
// @route   PUT /api/products/:id
exports.updateProduct = async (req, res, next) => {
    try {
        const product = await Product.findOneAndUpdate(
            { _id: req.params.id, company: req.user.company },
            req.body,
            { new: true, runValidators: true }
        );
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.json({ success: true, data: product });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
exports.deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findOneAndDelete({ _id: req.params.id, company: req.user.company });
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        await Batch.deleteMany({ product: req.params.id, company: req.user.company });
        res.json({ success: true, message: 'Product and associated batches deleted' });
    } catch (error) {
        next(error);
    }
};

// @desc    Get low stock products
// @route   GET /api/products/alerts/low-stock
exports.getLowStock = async (req, res, next) => {
    try {
        const products = await Product.find({
            company: req.user.company,
            $expr: { $lte: ['$totalStock', '$lowStockThreshold'] },
            isActive: true,
        }).sort({ totalStock: 1 });

        res.json({ success: true, data: products, count: products.length });
    } catch (error) {
        next(error);
    }
};

// @desc    Get expiring batches (within 30 days)
// @route   GET /api/products/alerts/expiring
exports.getExpiringBatches = async (req, res, next) => {
    try {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const batches = await Batch.find({
            company: req.user.company,
            expiryDate: { $lte: thirtyDaysFromNow },
            quantity: { $gt: 0 },
            isActive: true,
        })
            .populate('product', 'name category brand')
            .sort({ expiryDate: 1 });

        res.json({ success: true, data: batches, count: batches.length });
    } catch (error) {
        next(error);
    }
};

// @desc    Get batches for a product
// @route   GET /api/products/:id/batches
exports.getProductBatches = async (req, res, next) => {
    try {
        let batches = await Batch.find({ product: req.params.id, quantity: { $gt: 0 }, company: req.user.company })
            .populate('supplier', 'companyName')
            .sort({ expiryDate: 1 });

        // If no batches exist but product has stock, create a real default batch
        if (batches.length === 0) {
            const product = await Product.findOne({ _id: req.params.id, company: req.user.company });
            if (product && product.totalStock > 0) {
                const newBatch = await Batch.create({
                    product: product._id,
                    company: req.user.company,
                    batchNumber: 'GENERAL',
                    sellingPrice: product.sellingPrice || 0,
                    purchasePrice: product.purchasePrice || 0,
                    quantity: product.totalStock,
                    initialQuantity: product.totalStock,
                    expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // 1 year fallback
                });
                return res.json({ success: true, data: [newBatch] });
            }
        }

        res.json({ success: true, data: batches });
    } catch (error) {
        next(error);
    }
};
