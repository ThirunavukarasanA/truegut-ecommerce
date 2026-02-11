
import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "default_development_key_change_me_in_prod";

export const encrypt = (data) => {
     if (!data) return null;
     // If data is an object, stringify it first
     const payload = typeof data === 'object' ? JSON.stringify(data) : data.toString();
     return CryptoJS.AES.encrypt(payload, SECRET_KEY).toString();
};

export const decrypt = (cipherText) => {
     if (!cipherText) return null;
     try {
          const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
          const decryptedData = bytes.toString(CryptoJS.enc.Utf8);

          if (!decryptedData) return null;

          // Try to parse back to JSON if possible
          try {
               return JSON.parse(decryptedData);
          } catch (e) {
               return decryptedData; // Return as string if not JSON
          }
     } catch (error) {
          console.error("Decryption failed:", error);
          return null;
     }
};
