

const BASE_URL = 'http://localhost:3051'; // Adjust if needed
const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'password123';

async function testAPI() {
     console.log('🚀 Starting API Integration Tests...');

     try {
          // 1. Login to get token
          console.log('\n🔐 Phase 1: Login');
          const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
          });

          const loginData = await loginRes.json();
          if (!loginRes.ok) throw new Error(`Login failed: ${loginData.error}`);

          const cookie = loginRes.headers.get('set-cookie');
          console.log('✅ Login successful');

          const headers = {
               'Content-Type': 'application/json',
               'Cookie': cookie
          };

          // 2. Test Category API
          console.log('\n📁 Phase 2: Category API');
          const catName = `Test Category ${Date.now()}`;
          const catRes = await fetch(`${BASE_URL}/api/admin/catalog/categories`, {
               method: 'POST',
               headers,
               body: JSON.stringify({ name: catName, description: 'Test Description' })
          });
          const catData = await catRes.json();
          if (catRes.ok) {
               console.log(`✅ Created Category: ${catData.data.name}`);
          } else {
               console.error(`❌ Failed to create category: ${catData.error}`);
          }

          // Test Duplicate
          console.log('   Testing Duplicate Category...');
          const dupCatRes = await fetch(`${BASE_URL}/api/admin/catalog/categories`, {
               method: 'POST',
               headers,
               body: JSON.stringify({ name: catName })
          });
          const dupCatData = await dupCatRes.json();
          if (!dupCatRes.ok && dupCatData.error.includes('already exists')) {
               console.log('✅ Duplicate category check passed');
          } else {
               console.error('❌ Duplicate category check failed');
          }

          const categoryId = catData.data?._id;

          // 3. Test Product API
          if (categoryId) {
               console.log('\n🛍️ Phase 3: Product API');
               const prodRes = await fetch(`${BASE_URL}/api/admin/catalog/products`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                         name: 'Test Product',
                         category: categoryId,
                         price: 99.99,
                         description: 'Test Product Description'
                    })
               });
               const prodData = await prodRes.json();
               if (prodRes.ok) {
                    console.log(`✅ Created Product: ${prodData.data.name}`);
               } else {
                    console.error(`❌ Failed to create product: ${prodData.error}`);
               }

               // Test Invalid Category
               console.log('   Testing Invalid Category ID...');
               const invProdRes = await fetch(`${BASE_URL}/api/admin/catalog/products`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                         name: 'Fail Product',
                         category: '6451600182e8fbe9556295bc', // Valid format but non-existent
                         price: 10
                    })
               });
               const invProdData = await invProdRes.json();
               if (!invProdRes.ok && invProdData.error.includes('does not exist')) {
                    console.log('✅ Invalid category check passed');
               } else {
                    console.error('❌ Invalid category check failed');
               }
          }

          // 4. Test Vendor API
          console.log('\n🚚 Phase 4: Vendor API');
          const vendorEmail = `vendor_${Date.now()}@test.com`;
          const vRes = await fetch(`${BASE_URL}/api/admin/vendors`, {
               method: 'POST',
               headers,
               body: JSON.stringify({
                    name: 'Test Vendor',
                    email: vendorEmail,
                    phone: '1234567890',
                    serviceablePincodes: ['110001', '110002']
               })
          });
          const vData = await vRes.json();
          if (vRes.ok) {
               console.log(`✅ Created Vendor: ${vData.data.name}`);
          } else {
               console.error(`❌ Failed to create vendor: ${vData.error}`);
          }

          console.log('\n🎉 All tests completed!');

     } catch (error) {
          console.error('\n💥 Critical Test Error:', error.message);
          console.log('\n💡 Tip: Make sure the server (npm run dev) is running on port 3051.');
     }
}

testAPI();
