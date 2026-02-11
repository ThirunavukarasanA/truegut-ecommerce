
import { encrypt, decrypt } from "@/lib/encryption";
import { toast } from "react-hot-toast";

/**
 * Enhanced fetch wrapper that handles encryption for requests and decryption for responses.
 * @param {string} url - API Endpoint
 * @param {object} options - Fetch options (method, headers, body, etc.)
 */
export const secureFetch = async (url, options = {}) => {
     const { body, headers = {}, ...rest } = options;

     let requestBody = body;

     // Encryption disabled temporarily
     if (body && !(body instanceof FormData)) {
          requestBody = JSON.stringify(body);
          headers["Content-Type"] = "application/json";
     }

     try {
          const response = await fetch(url, {
               ...rest,
               headers,
               body: requestBody,
          });

          // Valid JSON response check
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.indexOf("application/json") !== -1) {
               const data = await response.json();

               // Decryption disabled temporarily
               if (data.encryptedData) {
                    return decrypt(data.encryptedData);
               }

               return data;
          }

          return response;
     } catch (error) {
          console.error("SecureFetch Error:", error);
          throw error;
     }
};
