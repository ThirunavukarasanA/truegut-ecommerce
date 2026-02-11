import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Pincode from '@/models/Pincode';
import State from '@/models/State';
import StateLoad from '@/models/StateLoad';
import { getAuthenticatedUser } from '@/lib/admin/api-auth';
import { generateStatePincodes } from '@/lib/admin/pincodeGeneration';

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

          const { searchParams } = new URL(req.url);
          const search = searchParams.get('search') || '';
          const state = searchParams.get('state');
          const page = parseInt(searchParams.get('page')) || 1;
          const limit = parseInt(searchParams.get('limit')) || 20;
          const skip = (page - 1) * limit;

          const query = {};
          if (state) query.state = state;
          if (search) {
               query.$or = [
                    { pincode: { $regex: search, $options: 'i' } },
                    { district: { $regex: search, $options: 'i' } },
               ];
          }

          const total = await Pincode.countDocuments(query);
          const pincodes = await Pincode.find(query)
               .sort({ pincode: 1 })
               .skip(skip)
               .limit(limit);

          return NextResponse.json({
               pincodes,
               pagination: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit)
               }
          });
     } catch (error) {
          console.error('Error fetching pincodes:', error);
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

          const body = await req.json();

          // GENERATION LOGIC (Background)
          if (body.generate && body.stateCode) {
               const state = await State.findOne({ code: body.stateCode });
               if (!state) return NextResponse.json({ error: 'State not found' }, { status: 404 });

               // Check for existing running job for THIS state
               const existingJob = await StateLoad.findOne({
                    stateCode: body.stateCode,
                    status: { $in: ['pending', 'running'] }
               });

               if (existingJob) {
                    return NextResponse.json({ error: 'A generation job is already running for this state' }, { status: 409 });
               }

               // 1. SCRAPE & SEED (Sync or Async? - Sync is better for user feedback if fast enough, else Async)
               // Scraping is usually fast (1 HTTP request).
               try {
                    const { scrapePincodesForState } = await import('@/lib/admin/pincodeScraper');
                    const pincodes = await scrapePincodesForState(state.code); // Assuming state.code maps to External ID (1, 2... etc)

                    if (pincodes.length > 0) {
                         const bulkOps = pincodes.map(code => ({
                              updateOne: {
                                   filter: { pincode: code },
                                   update: {
                                        $set: {
                                             stateId: state._id,
                                             state: state.name,
                                             stateCode: state.code
                                        },
                                        $setOnInsert: {
                                             pincode: code,
                                             status: 'pending',
                                             active: false,
                                             isServiceable: true
                                        }
                                   },
                                   upsert: true
                              }
                         }));
                         await Pincode.bulkWrite(bulkOps);
                    } else {

                         // Should we abort? Maybe.
                    }

                    // 2. CREATE JOB
                    const newJob = await StateLoad.create({
                         stateId: state._id,
                         state: state.name,
                         stateCode: state.code,
                         status: 'pending',
                         totalPincodes: pincodes.length // Initial known total
                    });

                    return NextResponse.json({
                         message: `Seeded ${pincodes.length} pincodes. Job queued for hydration.`,
                         jobId: newJob._id,
                         status: 'pending',
                         seededCount: pincodes.length
                    });

               } catch (err) {
                    console.error("Scraping failed:", err);
                    return NextResponse.json({ error: `Scraping failed: ${err.message}` }, { status: 500 });
               }
          }

          return NextResponse.json({ error: 'Invalid Request' }, { status: 400 });
     } catch (error) {
          console.error('Error generating pincodes:', error);
          return NextResponse.json({ error: error.message }, { status: 500 });
     }
}

// Update Pincode (Toggle Serviceability)
export async function PUT(req) {
     try {
          await connectDB();
          const user = await getAuthenticatedUser(req);
          if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

          const body = await req.json();
          const { id, isServiceable } = body;

          // Toggle Serviceability
          if (id && typeof isServiceable === 'boolean') {
               const updated = await Pincode.findByIdAndUpdate(
                    id,
                    { isServiceable },
                    { new: true }
               );
               if (!updated) return NextResponse.json({ error: 'Pincode not found' }, { status: 404 });
               return NextResponse.json({ message: 'Updated successfully', pincode: updated });
          }

          return NextResponse.json({ error: 'Invalid Request' }, { status: 400 });

     } catch (error) {
          console.error('Error updating pincode:', error);
          return NextResponse.json({ error: error.message }, { status: 500 });
     }
}

export async function DELETE(req) {
     try {
          await connectDB();
          const user = await getAuthenticatedUser(req);
          if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

          const { ids } = await req.json();
          await Pincode.deleteMany({ _id: { $in: ids } });

          return NextResponse.json({ message: 'Deleted successfully' });
     } catch (error) {
          return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
     }
}
