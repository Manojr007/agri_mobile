const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Company = require('./models/Company');

dotenv.config();

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for seeding...');

        // Create Default Company if not exists
        let company = await Company.findOne({ name: 'AgriERP Retail' });
        if (!company) {
            company = await Company.create({
                name: 'AgriERP Retail',
                gstNumber: '27AAAAA0000A1Z5',
                email: 'contact@agrierp.com',
                phone: '9876543210',
                address: {
                    street: 'Main Market',
                    city: 'Nagpur',
                    state: 'Maharashtra',
                    pincode: '440001'
                },
                financialYearStart: new Date(new Date().getFullYear(), 3, 1),
                financialYearEnd: new Date(new Date().getFullYear() + 1, 2, 31)
            });
            console.log('✅ Default Company Settings Created');
        }

        // Clear existing users to avoid duplicates
        await User.deleteMany({ email: 'admin@agrierp.com' });

        // Create Admin User
        const admin = await User.create({
            name: 'Agri Admin',
            email: 'admin@agrierp.com',
            password: 'password123',
            role: 'admin',
            company: company._id
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
        process.exit(1);
    }
};

seed();
