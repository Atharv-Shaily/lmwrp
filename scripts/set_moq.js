const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable inside .env');
    process.exit(1);
}

async function setMOQ() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find a product to update (e.g., the first one)
        const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({ minOrderQuantity: Number }, { strict: false }));

        const product = await Product.findOne();
        if (product) {
            product.minOrderQuantity = 5;
            await product.save();
            console.log(`Updated product "${product.name || product._id}" with minOrderQuantity: 5`);
        } else {
            console.log('No products found to update.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
    }
}

setMOQ();
