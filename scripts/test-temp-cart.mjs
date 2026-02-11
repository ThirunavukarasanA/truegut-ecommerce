const baseUrl = 'http://localhost:3051';

async function runTest() {
     try {
          console.log("Testing GET /api/temp-cart...");
          const res = await fetch(`${baseUrl}/api/temp-cart`);
          const data = await res.json();
          console.log("Response:", JSON.stringify(data, null, 2));

          if (data.success) {
               console.log("Temp Cart API works!");
          } else {
               console.error("Temp Cart API failed:", data.error);
          }

     } catch (error) {
          console.error("Test failed:", error);
     }
}
runTest();
