
import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import Pincode from '@/models/Pincode';
import State from '@/models/State';
import StateLoad from '@/models/StateLoad';
import fs from 'fs';
import path from 'path';
import dbConnect from '@/lib/admin/db';

export async function GET(req) {
     const { searchParams } = new URL(req.url);
     const externalStateId = searchParams.get('stateId');

     if (!externalStateId) {
          return NextResponse.json({ error: "stateId (external) is required" }, { status: 400 });
     }

     try {
          await dbConnect();

          // 1. Map External State ID to Internal State Definition
          const jsonPath = path.join(process.cwd(), 'data', 'statecode.json');
          const fileContents = fs.readFileSync(jsonPath, 'utf8');
          const stateCodes = JSON.parse(fileContents);

          const stateMapping = stateCodes.find(s => s.code === externalStateId);

          if (!stateMapping) {
               return NextResponse.json({ error: "Invalid External State ID not found in statecode.json" }, { status: 404 });
          }

          const dbState = await State.findOne({
               name: { $regex: new RegExp(`^${stateMapping.name}$`, 'i') }
          });

          if (!dbState) {
               return NextResponse.json({ error: `State '${stateMapping.name}' not found in database. Please ensure State is created first.` }, { status: 404 });
          }

          // 2. Scrape Pincodes
          const url = `http://www.postalpincode.in/Search-By-Location?StateId=${externalStateId}`;
          const response = await fetch(url);
          const html = await response.text();
          const $ = cheerio.load(html);

          const pincodes = new Set();
          const text = $("body").text();
          const matches = text.match(/\b\d{6}\b/g);

          if (matches) {
               matches.forEach((pin) => pincodes.add(pin));
          }

          const uniquePincodes = Array.from(pincodes);

          if (uniquePincodes.length === 0) {
               // Only return if truly 0. 
               // Warn but continue if we want to create a failed job? 
               // If 0, we can't create a meaningful job.
               return NextResponse.json({ message: "No pincodes found on the page", url }, { status: 200 });
          }

          // 3. Bulk Upsert (Seed)
          const bulkOps = uniquePincodes.map(code => ({
               updateOne: {
                    filter: { pincode: code },
                    update: {
                         $set: {
                              pincode: code,
                              state: dbState.name,
                              stateId: dbState._id,
                              stateCode: dbState.code,
                         },
                         $setOnInsert: {
                              status: 'pending',
                              active: false,
                              isServiceable: true
                         }
                    },
                    upsert: true
               }
          }));

          if (bulkOps.length > 0) {
               await Pincode.bulkWrite(bulkOps);
          }

          // 4. CHECK & CREATE JOB (Critical for Scheduler)
          // Check if a job is already running/pending
          let job = await StateLoad.findOne({
               stateId: dbState._id,
               status: { $in: ['pending', 'running'] }
          });

          if (!job) {
               // Create new job
               job = await StateLoad.create({
                    stateId: dbState._id,
                    state: dbState.name,
                    stateCode: dbState.code,
                    status: 'pending',
                    totalPincodes: uniquePincodes.length
               });
          } else {
          }

          return NextResponse.json({
               state: dbState.name,
               externalStateId,
               found: uniquePincodes.length,
               message: `Seeded ${uniquePincodes.length} pincodes. Job Queued: ${job._id}`
          });

     } catch (err) {
          console.error(err);
          return NextResponse.json({ error: err.message }, { status: 500 });
     }
}
