import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import State from '@/models/State';
import { getAuthenticatedUser } from '@/lib/admin/api-auth';
import { promises as fs } from 'fs';
import path from 'path';
import postalcodes from 'postalcodes-india';

const connectDB = async () => {
     if (mongoose.connections[0].readyState) return;
     await mongoose.connect(process.env.MONGODB_URI);
};

export async function GET(req) {
     try {
          await connectDB();
          const user = await getAuthenticatedUser(req);
          if (!user) {
               return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const states = await State.find({}).sort({ name: 1 });
          return NextResponse.json(states);
     } catch (error) {
          console.error('Error fetching states:', error);
          return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
     }
}

export async function POST(req) {
     try {
          await connectDB();
          const user = await getAuthenticatedUser(req);
          if (!user) {
               return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
          }

          // Read from data/statecode.json
          const jsonPath = path.join(process.cwd(), 'data', 'statecode.json');

          let localStatesData = [];
          try {
               const fileContents = await fs.readFile(jsonPath, 'utf8');
               localStatesData = JSON.parse(fileContents);
          } catch (error) {
               console.error('Error reading statecode.json:', error);
               return NextResponse.json({ error: 'Failed to read state data file' }, { status: 500 });
          }

          (`Found ${localStatesData.length} states in JSON`);

          // Check against npm package
          let missingStates = [];
          try {
               if (typeof postalcodes.getStates === 'function') {
                    const npmStates = postalcodes.getStates();
                    // Create a set of normalized names from local JSON for comparison
                    const localStateNames = new Set(localStatesData.map(s => s.code.toLowerCase()));

                    npmStates.forEach(npmState => {
                         if (!localStateNames.has(npmState.code.toLowerCase())) {
                              missingStates.push({ code: npmState.code, name: npmState.name });
                         }
                    });
               }
          } catch (e) {
               console.warn("Failed to compare with npm package:", e);
          }

          let upsertedCount = 0;
          for (const state of localStatesData) {
               // JSON Structure:
               // { "code": "01", "name": "Andaman...", "statecode": "AN", "range": [744101, 744999] }

               await State.findOneAndUpdate(
                    { code: state.code },
                    {
                         name: state.name,
                         shortName: state.shortname, // Fixed camelCase mapping
                         code: state.code,
                         range: state.range,
                         isServiceable: true
                    },
                    { upsert: true, new: true, setDefaultsOnInsert: true }
               );
               upsertedCount++;
          }

          return NextResponse.json({
               message: 'States synced successfully from JSON',
               count: upsertedCount,
               missingStates: missingStates
          });
     } catch (error) {
          console.error('Error syncing states:', error);
          return NextResponse.json({ error: error.message }, { status: 500 });
     }
}
