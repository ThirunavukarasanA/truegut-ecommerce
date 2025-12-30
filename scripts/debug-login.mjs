import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();
import mongoose from 'mongoose';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI;

const debugLogin = async () => {
     try {
          await mongoose.connect(MONGODB_URI);
          console.log('📦 Connected to MongoDB');

          const email = 'admin@gmail.com';
          const password = '123456';

          const user = await User.findOne({ email });

          if (!user) {
               console.log(`❌ User ${email} NOT FOUND in DB.`);
          } else {
               console.log(`✅ User found: ${user.email}`);
               console.log(`🔑 Stored Password Hash: ${user.password}`);

               const isMatch = await bcrypt.compare(password, user.password);
               console.log(`🕵️ Testing password '${password}': ${isMatch ? '✅ MATCH' : '❌ NO MATCH'}`);

               if (!isMatch) {
                    console.log('Is the stored password actually hashed?');
                    console.log('Starts with $2? : ', user.password.startsWith('$2'));
               }
          }

          process.exit(0);
     } catch (error) {
          console.error('❌ Error:', error);
          process.exit(1);
     }
};

debugLogin();
