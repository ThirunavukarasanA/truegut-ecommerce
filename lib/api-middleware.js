
import { NextResponse } from "next/server";
import { encrypt, decrypt } from "@/lib/encryption";

/**
 * Higher-order function to wrap API route handlers with encryption support.
 * @param {Function} handler - The original API handler (GET, POST, etc.)
 */
export function withEncryption(handler) {
     return async (req, params) => {
          // 1. Decrypt Request Body (if POST/PUT)
          if (req.method === "POST" || req.method === "PUT") {
               try {
                    const body = await req.json().catch(() => null);
                    if (body && body.data) {
                         // Assume body is { data: "encrypted_string" }
                         const decrypted = decrypt(body.data);

                         if (decrypted) {
                              // Mock req.json() to return decrypted data for the handler
                              req.json = async () => decrypted;
                         } else {

                         }
                    }
               } catch (e) {
                    // No body or invalid JSON, proceed as is (might be intentional)
               }
          }

          // 2. Call the original handler
          const response = await handler(req, params);

          // 3. Encrypt Response Body
          // Next.js NextResponse is a bit tricky to intercept body from.
          // We can't easily "read" the stream of a created NextResponse and replace it without cloning/reading.

          // Instead of intercepting the response object, we expect the handler to return a JSON object (not NextResponse)
          // and let THIS wrapper create the NextResponse? 
          // NO, Next.js App Router handlers MUST return NextResponse.

          // So we have to read the response body.
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
               try {
                    // We need to clone to read body, but then we can't modify the original response.
                    // We have to create a new response.
                    const data = await response.json();

                    // If it's an error, maybe don't encrypt? OR encrypt everything as requested.
                    // User said "all req and response encrypt".
                    // So we encrypt the entire JSON payload.

                    const encryptedData = encrypt(data);

                    // Return new response with encrypted data
                    return NextResponse.json({ encryptedData });
               } catch (e) {
                    console.error("Response encryption failed", e);
                    // Return original if something goes wrong
                    return response;
               }
          }

          return response;
     };
}
