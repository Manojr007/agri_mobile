const mongoose = require('mongoose');

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

  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
