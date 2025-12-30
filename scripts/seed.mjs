import dotenv from 'dotenv';
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
               // Check if user exists
               const exists = await User.findOne({ email: u.email });
               if (exists) {
                    console.log(`⚠️ User ${u.email} already exists. Skipping.`);
                    continue;
               }

               // Create user - pre-save hook will hash password
               // We explicitly create a new instance to ensure pre-save hooks run properly if using insertMany might bypass? 
               // User.create triggers save, so hooks run.
               await User.create(u);
               console.log(`✅ Created user: ${u.email} (Role: ${u.role})`);
          }

          console.log('🎉 Seeding complete!');
          process.exit(0);

     } catch (error) {
          console.error('❌ Seeding failed:', error);
          process.exit(1);
     }
};

seedUsers();
