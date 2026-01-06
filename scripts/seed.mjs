import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
dotenv.config({ path: '.env.local' });
dotenv.config();
import mongoose from 'mongoose';
import User from '../models/User.js'; // Ensure extension is used for ESM

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
     console.error('Please define the MONGODB_URI environment variable inside .env.local or .env');
     process.exit(1);
}

const seedUsers = async () => {
     try {
          await mongoose.connect(MONGODB_URI);
          console.log('📦 Connected to MongoDB');

          const users = [
               {
                    email: 'admin@gmail.com',
                    password: '123456', // Strong default
                    role: 'system_admin',
               },
               {
                    email: 'owner@fermentaa.com',
                    password: 'ownerTemplatePassword123!', // Strong default
                    role: 'owner',
               }
          ];

          for (const u of users) {
               for (const u of users) {
                    // Hash password
                    const salt = await bcrypt.genSalt(10);
                    const hashedPassword = await bcrypt.hash(u.password, salt);

                    // Upsert user (Create or Update)
                    await User.findOneAndUpdate(
                         { email: u.email },
                         { ...u, password: hashedPassword },
                         { upsert: true, new: true, setDefaultsOnInsert: true }
                    );
                    console.log(`✅ Seeded user: ${u.email} (Role: ${u.role})`);
               }
          }

          console.log('🎉 Seeding complete!');
          process.exit(0);

     } catch (error) {
          console.error('❌ Seeding failed:', error);
          process.exit(1);
     }
};

seedUsers();
