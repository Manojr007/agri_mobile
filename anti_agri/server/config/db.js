const mongoose = require('mongoose');

// Import models to register them and run migrations
const Company = require('../models/Company');
const User = require('../models/User');
const Product = require('../models/Product');
const Batch = require('../models/Batch');
const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');
const Sale = require('../models/Sale');
const Purchase = require('../models/Purchase');
const Ledger = require('../models/Ledger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Drop old global unique indexes to allow company-scoped duplicates
    try {
      const db = conn.connection.db;

      // Drop barcode_1 index from products
      try {
        await db.collection('products').dropIndex('barcode_1');
        console.log('✅ Dropped old unique index: products.barcode_1');
      } catch (e) {
        // Index might not exist, ignore
      }

      // Drop name_1 index from counters
      try {
        await db.collection('counters').dropIndex('name_1');
        console.log('✅ Dropped old unique index: counters.name_1');
      } catch (e) {
        // Index might not exist, ignore
      }

      // Drop invoiceNumber_1 index from sales
      try {
        await db.collection('sales').dropIndex('invoiceNumber_1');
        console.log('✅ Dropped old unique index: sales.invoiceNumber_1');
      } catch (e) {
        // Index might not exist, ignore
      }

      // Drop invoiceNumber_1 index from purchases
      try {
        await db.collection('purchases').dropIndex('invoiceNumber_1');
        console.log('✅ Dropped old unique index: purchases.invoiceNumber_1');
      } catch (e) {
        // Index might not exist, ignore
      }
    } catch (indexError) {
      console.error('⚠️ Index drop failed:', indexError.message);
    }

    // Migrate legacy data: associate documents missing 'company' with the default company
    try {
      let defaultCompany = await Company.findOne({ name: 'AgriERP Retail' });
      if (!defaultCompany) {
        defaultCompany = await Company.create({
          name: 'AgriERP Retail',
          gstNumber: '27AAAAA0000A1Z5',
          phone: '9876543210',
          email: 'admin@agrierp.com',
          address: {
            street: '123 Agri Road',
            city: 'Pune',
            state: 'Maharashtra',
            pincode: '411001'
          }
        });
        console.log('✅ Default Company Settings Created on connection');
      }

      if (defaultCompany) {
        const resultProduct = await Product.updateMany({ company: { $exists: false } }, { $set: { company: defaultCompany._id } });
        const resultBatch = await Batch.updateMany({ company: { $exists: false } }, { $set: { company: defaultCompany._id } });
        const resultCustomer = await Customer.updateMany({ company: { $exists: false } }, { $set: { company: defaultCompany._id } });
        const resultSupplier = await Supplier.updateMany({ company: { $exists: false } }, { $set: { company: defaultCompany._id } });
        const resultSale = await Sale.updateMany({ company: { $exists: false } }, { $set: { company: defaultCompany._id } });
        const resultPurchase = await Purchase.updateMany({ company: { $exists: false } }, { $set: { company: defaultCompany._id } });
        const resultLedger = await Ledger.updateMany({ company: { $exists: false } }, { $set: { company: defaultCompany._id } });
        const resultUser = await User.updateMany({ company: { $exists: false } }, { $set: { company: defaultCompany._id } });

        console.log(`📊 Migrated legacy data to default company: Products: ${resultProduct.modifiedCount}, Customers: ${resultCustomer.modifiedCount}, Users: ${resultUser.modifiedCount}`);
      }
    } catch (migrationError) {
      console.error('⚠️ Database migration failed:', migrationError.message);
    }

  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
