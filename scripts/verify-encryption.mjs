
import CryptoJS from 'crypto-js';

const SECRET_KEY = "default_development_key_change_me_in_prod";

const encryptFn = (data) => {
     const payload = typeof data === 'object' ? JSON.stringify(data) : data.toString();
     return CryptoJS.AES.encrypt(payload, SECRET_KEY).toString();
};

const decryptFn = (cipherText) => {
     const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
     const originalIndex = bytes.toString(CryptoJS.enc.Utf8);
     try {
          return JSON.parse(originalIndex);
     } catch (e) {
          return originalIndex;
     }
};

async function testTempCustomer() {
     console.log("Testing /api/temp-customer...");
     const payload = {
          firstName: "Test",
          lastName: "User",
          email: "test@example.com"
     };

     // Test POST
     const encryptedBody = encryptFn(payload);
     try {
          const res = await fetch("http://localhost:3051/api/temp-customer", {
               method: "POST",
               headers: {
                    "Content-Type": "application/json",
                    "Cookie": "cart_session_id=test-session-123"
               },
               body: JSON.stringify({ data: encryptedBody })
          });

          const data = await res.json();
          console.log("POST Response Status:", res.status);

          if (data.encryptedData) {
               const decrypted = decryptFn(data.encryptedData);
               console.log("POST Decrypted Response:", decrypted);
               if (decrypted.success) {
                    console.log("SUCCESS: Response verified.");
               } else {
                    console.warn("WARNING: 'success' flag missing or false in POST response.");
               }
          } else {
               console.log("POST Response (Unencrypted?):", data);
          }

          // Test GET
          const resGet = await fetch("http://localhost:3051/api/temp-customer", {
               method: "GET",
               headers: {
                    "Cookie": "cart_session_id=test-session-123"
               }
          });
          const dataGet = await resGet.json();
          console.log("GET Response Status:", resGet.status);
          if (dataGet.encryptedData) {
               const decryptedGet = decryptFn(dataGet.encryptedData);
               console.log("GET Decrypted Response:", decryptedGet);
               if (decryptedGet.success && decryptedGet.firstName === "Test") {
                    console.log("SUCCESS: Data persisted and retrieved.");
               }
          }

     } catch (e) {
          console.error("Error:", e);
     }
}

async function testOrderValidation() {
     console.log("\nTesting /api/checkout/validate...");
     // Mock Item (Needs valid IDs or it will fail validation, but we check structure)
     // Use random IDs just to check if it decrypts request and returns encrypted response
     const valPayload = { items: [], location: { pincode: "600001" } };
     const encVal = encryptFn(valPayload);

     try {
          const res = await fetch("http://localhost:3051/api/checkout/validate", {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({ data: encVal })
          });
          const data = await res.json();
          console.log("Validation Status:", res.status);

          if (data.encryptedData) {
               const decrypted = decryptFn(data.encryptedData);
               console.log("Validation Decrypted:", decrypted);
               // Even if it returns error about items, it should be an encrypted object with success:false 
               // OR success:false and error (if header 400).
               // My updated code returns success:false, error: ... in status 400 IF it is an error.
               // Wait, did I encrypt 400 errors?
               // My code: return NextResponse.json({ success: false, error: '...' }, { status: 400 }) for "No items".
               // So errors are plaintext? 
               // CHECK CODE:
               // if (!items...) return NextResponse.json({ success: false, error: ... }) -> Plaintext.

               // But if errors.length > 0 (Validation failures, status 200 usually? Or 200 with success:false?)
               // Code: return NextResponse.json({ encryptedData: encrypt({ success: false, ... }) });
               // This is 200 OK but logical failure.

               if (decrypted.success !== undefined) {
                    console.log("SUCCESS: Response structure correct.");
               }
          } else {
               console.log("Validation Response (Likely Plaintext Error):", data);
          }
     } catch (e) {
          console.error("Validation Error", e);
     }
}

async function run() {
     await testTempCustomer();
     await testOrderValidation();
}

run();
