// Using global fetch (Node 18+)
const BASE_URL = 'http://localhost:3051';

async function verify() {
     console.log("Starting Verification...");

     // 1. Get Products
     console.log("\n1. Fetching Products...");
     const productsRes = await fetch(`${BASE_URL}/api/products?limit=1`);
     const productsData = await productsRes.json();

     if (!productsData.success || !productsData.products.length) {
          console.error("Failed to fetch products or no products found. Response:", JSON.stringify(productsData, null, 2));
          return;
     }
     const product = productsData.products[0];
     console.log(`PASS: Found product: ${product.name} (${product.slug})`);

     // Get Single Product for details (variants)
     const detailRes = await fetch(`${BASE_URL}/api/products/${product.slug}`);
     const detailData = await detailRes.json();
     const variantId = detailData.product.variants[0]._id;
     const price = detailData.product.variants[0].price;
     console.log(`PASS: Got variant ID: ${variantId}, Price: ${price}`);

     // 2. Signup
     console.log("\n2. Customer Signup...");
     const email = `testuser_${Date.now()}@example.com`;
     const password = 'password123';
     const signupRes = await fetch(`${BASE_URL}/api/auth/customer/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Test User', email, password, phone: '1234567890' })
     });
     const signupData = await signupRes.json();
     if (signupData.success) {
          console.log(`PASS: Signup successful for ${email}`);
     } else {
          console.error("Signup Failed:", signupData);
          // Might fail if user exists, but I used unique email.
     }

     // 3. Login
     console.log("\n3. Customer Login...");
     const loginRes = await fetch(`${BASE_URL}/api/auth/customer/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
     });
     const loginData = await loginRes.json();

     // Extract Cookies
     const cookies = loginRes.headers.get('set-cookie');
     if (loginData.success && cookies) {
          console.log("PASS: Login successful, got token.");
     } else {
          console.error("Login Failed:", loginData);
          return;
     }

     // 4. Add to Cart (Persistent)
     console.log("\n4. Add to Cart...");
     const cartRes = await fetch(`${BASE_URL}/api/cart`, {
          method: 'POST',
          headers: {
               'Content-Type': 'application/json',
               'Cookie': cookies
          },
          body: JSON.stringify({
               productId: product._id,
               variantId: variantId,
               quantity: 1,
               price: price, // API expects price? Yes based on code.
               name: product.name,
               image: "test.jpg"
          })
     });
     const cartData = await cartRes.json();

     if (cartData.success) {
          console.log("PASS: Added to cart.");
     } else {
          console.error("Add to Cart Failed:", cartData);
          // Could be stock issue?
     }

     // 5. Checkout Validate
     console.log("\n5. Checkout Validation...");
     const validateRes = await fetch(`${BASE_URL}/api/checkout/validate`, {
          method: 'POST',
          headers: { 'Cookie': cookies } // Cookie is enough? POST body empty works if using session.
     });
     const validateData = await validateRes.json();

     if (validateData.valid) {
          console.log(`PASS: Cart Valid. Total: ${validateData.totalAmount}`);
     } else {
          console.error("Validation Failed:", validateData);
     }
}

verify().catch(console.error);
