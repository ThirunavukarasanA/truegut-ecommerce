import { NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/admin/cloudinary';
import { getAuthenticatedUser } from '@/lib/admin/api-auth';

export async function POST(req) {
     try {
          // Check authentication
          const user = await getAuthenticatedUser();
          const allowedRoles = ['admin', 'system_admin', 'owner'];
          if (!user || !allowedRoles.includes(user.role)) {
               return NextResponse.json(
                    { success: false, error: 'Unauthorized: Admin access required' },
                    { status: 401 }
               );
          }

          // Parse form data
          const formData = await req.formData();
          const file = formData.get('file');

          if (!file) {
               return NextResponse.json(
                    { success: false, error: 'No file provided' },
                    { status: 400 }
               );
          }

          // Convert file to base64
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

          // Upload to Cloudinary
          const result = await uploadToCloudinary(base64);

          return NextResponse.json({
               success: true,
               data: {
                    url: result.secure_url,
                    publicId: result.public_id,
               },
          });
     } catch (error) {
          console.error('Upload error:', error);
          return NextResponse.json(
               { success: false, error: error.message || 'Upload failed' },
               { status: 500 }
          );
     }
}

export async function DELETE(req) {
     try {
          // Check authentication
          const user = await getAuthenticatedUser();
          const allowedRoles = ['admin', 'system_admin', 'owner'];
          if (!user || !allowedRoles.includes(user.role)) {
               return NextResponse.json(
                    { success: false, error: 'Unauthorized' },
                    { status: 401 }
               );
          }

          const { publicId, url } = await req.json();

          let idToDelete = publicId;
          if (!idToDelete && url) {
               try {
                    // Extract publicId from URL
                    // Remove query params if any
                    const pureUrl = url.split('?')[0];
                    // Find segment after /upload/ and optional version v123/
                    const parts = pureUrl.split(/\/upload\/(?:v\d+\/)?/);
                    if (parts.length > 1) {
                         // The part after the split point is "folder/id.ext"
                         const pathWithExt = parts[1];
                         // Remove extension
                         idToDelete = pathWithExt.substring(0, pathWithExt.lastIndexOf('.'));
                    }
                    (`[Upload API] Extracted ID: ${idToDelete} from URL: ${url}`);
               } catch (err) {
                    console.error("[Upload API] Error extracting public ID:", err);
               }
          }

          if (!idToDelete) {
               return NextResponse.json(
                    { success: false, error: 'Missing publicId or valid URL' },
                    { status: 400 }
               );
          }

          // Delete from Cloudinary
          await deleteFromCloudinary(idToDelete);

          return NextResponse.json({ success: true, message: 'Image deleted' });
     } catch (error) {
          console.error('Delete error:', error);
          return NextResponse.json(
               { success: false, error: error.message || 'Delete failed' },
               { status: 500 }
          );
     }
}
