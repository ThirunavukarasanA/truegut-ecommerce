import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
     try {
          const cookieStore = await cookies();

          // Clear the admin tokens
          cookieStore.delete('admin_access_token');
          cookieStore.delete('admin_refresh_token');

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
