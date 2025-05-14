import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

if(!process.env.MONGOB_URL) {
  console.error('❌ MongoDB URL not found in environment variables');
  process.exit(1);
}

export async function connectToDb() {
    try {
        await mongoose.connect(process.env.MONGOB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        });

        console.log('✅ Connected to MongoDB');

    } catch (error) {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    }   

}


