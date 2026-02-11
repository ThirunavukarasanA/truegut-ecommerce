const baseUrl = 'http://localhost:3051';

// Simple cookie jar
let cookieJar = '';

async function fetchWithCookie(url, options = {}) {
     if (!options.headers) options.headers = {};
     if (cookieJar) options.headers['Cookie'] = cookieJar;

     const res = await fetch(url, options);

     // Update cookies
     const setCookie = res.headers.get('set-cookie');
     if (setCookie) {
          // Simple append/replace - usually sufficient for session testing
          const newCookie = setCookie.split(';')[0];
          if (cookieJar) {
               // Basic handling: if same key, replace; else append. 
               // For this app we mainly care about cart_session_id
               if (newCookie.startsWith('cart_session_id=')) {
                    cookieJar = newCookie;
               }
          } else {
               cookieJar = newCookie;
          }
     }
     return res;
}

async function runTest() {
     try {
          console.log("--- Starting Order Flow Test ---");

          // 1. Get Product
          console.log("Fetching product...");
          const prodRes = await fetch(`${baseUrl}/api/products?limit=1`);
          const prodData = await prodRes.json();
          if (!prodData.products?.length) throw new Error("No products found");
          const product = prodData.products[0];
          const variant = product.activeVariants[0];
          const price = variant.price;
          console.log(`Using Product: ${product.name}, Variant: ${variant.name}, Price: ${price}`);

          // 2. Add to Temp Cart
          console.log("\n--- Step 1: Add to Temp Cart ---");
          const cartRes = await fetchWithCookie(`${baseUrl}/api/temp-cart`, {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({
                    productId: product._id,
                    variantId: variant._id,
                    quantity: 1,
                    price: price,
                    name: product.name
               })
          });
          const cartData = await cartRes.json();
          console.log("Cart Add Result:", cartData.success ? "Success" : (cartData.error || "Failed"));
          if (!cartData.success) {
               console.error("Cart Add Failed:", JSON.stringify(cartData, null, 2));
               return;
          }

          // 3. Create Order
          console.log("\n--- Step 2: Create Order ---");
          const orderPayload = {
               customer: {
                    name: "Test Flow User",
                    email: "testflow@example.com",
                    phone: "9998887776",
                    address: {
                         street: "Flow St",
                         city: "Flow City",
                         pincode: "110001",
                         state: "Flow State",
                         country: "India"
                    }
               },
               items: [{
                    product: product._id,
                    variant: variant._id,
                    quantity: 1,
                    price: price
               }],
               paymentDetails: { method: "COD" }
          };

          const orderRes = await fetchWithCookie(`${baseUrl}/api/orders`, {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify(orderPayload)
          });
          const orderData = await orderRes.json();
          console.log("Order Creation Result:", orderData.success ? "Success" : "Failed");

          if (orderData.success) {
               // 4. Verify ID location
               if (orderData.data && orderData.data._id) {
                    console.log("SUCCESS: Order ID found at data.data._id");
               } else {
                    console.error("ERROR: Cannot find Order ID in response!", JSON.stringify(orderData, null, 2));
               }

               // 5. Verify Temp Cart Cleared
               console.log("\n--- Step 3: Verify Temp Cart Cleared ---");
               // Short delay to allow async operations if any (though await should handle it)
               await new Promise(r => setTimeout(r, 1000));

               const checkCartRes = await fetchWithCookie(`${baseUrl}/api/temp-cart`);
               const checkCartData = await checkCartRes.json();

               // Check if cart is empty or new session
               const items = checkCartData.cart?.items || [];
               console.log(`Cart Items: ${items.length}`);
               if (items.length === 0) {
                    console.log("SUCCESS: Temp Cart is empty.");
               } else {
                    console.error("FAILURE: Temp Cart still has items.");
               }

          } else {
               console.error("Order Creation Failed:", JSON.stringify(orderData, null, 2));
          }

     } catch (error) {
          console.error("Test failed:", error);
     }
}

runTest();
