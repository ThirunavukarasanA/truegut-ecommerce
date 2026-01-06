
import fetch from 'node-fetch';

const BASE_url = 'http://localhost:3000/api/products';
const SLUG = 'kombucha'; // Using a known slug from previous tests

async function verifyFrontendData() {
     console.log(`Fetching product with slug: ${SLUG}`);
     try {
          const res = await fetch(`${BASE_url}/${SLUG}`);
          const data = await res.json();

          if (!data.success) {
               console.error('API Error:', data);
               return;
          }

          const p = data.product;
          console.log('--- Product Data ---');
          console.log('Name:', p.name);
          console.log('Images (Raw):', p.images);
          console.log('Variants:', p.variants);

          // Frontend Logic Simulation
          const images = p.images?.map(img => img.url) || [];
          if (p.image) images.unshift(p.image);

          console.log('--- Frontend Computed ---');
          console.log('Computed Images:', images);

          if (p.variants && p.variants.length > 0) {
               console.log('Default Variant:', p.variants[0]);
               console.log('Displayed Price:', p.variants[0].price);
               console.log('Stock:', p.variants[0].stock);
          } else {
               console.log('No variants found!');
          }

     } catch (error) {
          console.error('Fetch failed:', error);
     }
}

verifyFrontendData();
