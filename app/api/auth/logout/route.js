import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
     try {
          const cookieStore = await cookies();

          // Clear the admin token cookie
          cookieStore.delete('admin_token');

          return NextResponse.json({
               success: true,
               message: 'Logged out successfully'
          });
     } catch (error) {
          return NextResponse.json({
               error: error.message
          }, { status: 500 });
     }
}
