const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable inside .env');
    process.exit(1);
}

async function checkUsers() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}, { strict: false }));

        // Find users with names containing "dhruv" or "reshma"
        const users = await User.find({
            $or: [
                { name: { $regex: 'dhruv', $options: 'i' } },
                { name: { $regex: 'reshma', $options: 'i' } },
                { businessName: { $regex: 'dhruv', $options: 'i' } },
                { businessName: { $regex: 'reshma', $options: 'i' } }
            ]
        });

        console.log(`Found ${users.length} users:`);
        users.forEach(u => {
            console.log('---------------------------------------------------');
            console.log(`Name: ${u.name}`);
            console.log(`Business Name: ${u.businessName}`);
            console.log(`Role: ${u.role}`);
            console.log(`Location:`, JSON.stringify(u.location, null, 2));
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
    }
}

checkUsers();
