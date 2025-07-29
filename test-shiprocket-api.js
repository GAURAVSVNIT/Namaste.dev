// Using Node.js built-in fetch (available in Node 18+)
// If you're using an older version, uncomment the line below:
// const fetch = require('node-fetch');

async function testShiprocketAPI() {
  try {
    console.log('🚀 Starting Shiprocket API test...');
    
    // First, get the authentication token from your local API
    console.log('📡 Fetching authentication token...');
    const tokenResponse = await fetch('http://localhost:3000/api/merchant/shiprocket/auth-token');
    const tokenData = await tokenResponse.json();
    
    if (!tokenData.success) {
      throw new Error(`Failed to get token: ${tokenData.error}`);
    }
    
    console.log('✅ Token received successfully');
    
    // Now make the products API request
    console.log('📦 Fetching products from Shiprocket...');
    const response = await fetch('https://apiv2.shiprocket.in/v1/external/products', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenData.token}`
      }
    });
    
    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ API Request Successful!');
      console.log('📋 Products Data:');
      console.log('Total products:', data.data?.length || 0);
      
      if (data.data && data.data.length > 0) {
        // Analyze all products
        console.log('\n🔍 All products analysis:');
        const realProducts = [];
        const placeholderProducts = [];
        
        data.data.forEach((product, index) => {
          const price = parseFloat(product.mrp || 0);
          const stock = parseInt(product.quantity || 0);
          const hasDescription = product.description && product.description !== 'No description available';
          
          // Check if it's a placeholder/category item
          const isPlaceholder = (
            price === 0 && 
            stock === 0 && 
            !hasDescription &&
            ['Electronics', 'Clothes', 'Medicines', 'Food', 'Documents', 'Groceries', 'Loose Goods', 'Others'].includes(product.name)
          );
          
          console.log(`${index + 1}. ${product.name || 'Unnamed Product'}`);
          console.log(`   ID: ${product.id}`);
          console.log(`   SKU: ${product.sku || 'N/A'}`);
          console.log(`   Price: ₹${price}`);
          console.log(`   Stock: ${stock}`);
          console.log(`   Description: ${product.description || 'No description'}`);
          console.log(`   Status: ${product.status || 'Unknown'}`);
          console.log(`   Type: ${product.type || 'Unknown'}`);
          console.log(`   Is Placeholder: ${isPlaceholder ? '🚫 YES' : '✅ NO'}`);
          console.log('');
          
          if (isPlaceholder) {
            placeholderProducts.push(product);
          } else {
            realProducts.push(product);
          }
        });
        
        console.log('📊 Summary:');
        console.log(`   Real Products: ${realProducts.length}`);
        console.log(`   Placeholder Items: ${placeholderProducts.length}`);
        
        if (placeholderProducts.length > 0) {
          console.log('\n🚫 Placeholder products found:');
          placeholderProducts.forEach(p => {
            console.log(`   - ${p.name} (ID: ${p.id}, SKU: ${p.sku})`);
          });
        }
        
        if (realProducts.length > 0) {
        console.log('✅ Real products with details:');
        realProducts.forEach((p, index) => {
          console.log(`   ${index + 1}. ${p.name}`);
          console.log(`      - Price: ₹${p.mrp}`);
          console.log(`      - Stock: ${p.quantity}`);
          console.log(`      - Status: ${p.status}`);
          console.log(`      - SKU: ${p.sku}`);
          console.log(`      - Created: ${p.created_at}`);
          console.log(`      - Updated: ${p.updated_at}`);
          console.log(`      - Description: ${p.description || 'No description'}`);
          console.log('');
        });
          
          console.log('\n📝 Sample real product structure:');
          console.log(JSON.stringify(realProducts[0], null, 2));
        }
      }
      
    } else {
      console.error('❌ API Request Failed:');
      console.error('Status:', response.status);
      console.error('Response:', data);
    }
    
  } catch (error) {
    console.error('🚨 Error occurred:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Test the new filtering function
async function testFilteredProducts() {
  try {
    console.log('\n🧪 Testing new product filtering...');
    
    const tokenResponse = await fetch('http://localhost:3000/api/merchant/shiprocket/auth-token');
    const tokenData = await tokenResponse.json();
    
    const response = await fetch('https://apiv2.shiprocket.in/v1/external/products', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenData.token}`
      }
    });
    
    const data = await response.json();
    
    // Simulate the new filtering (exclude placeholders and inactive)
    const filteredProducts = (data.data || []).filter(product => {
      const price = parseFloat(product.mrp || 0);
      const stock = parseInt(product.quantity || 0);
      const hasRealDescription = product.description && 
                                product.description !== 'No description' && 
                                product.description !== 'No description available';
      
      const placeholderCategories = [
        'Electronics', 'Clothes', 'Medicines', 'Food', 
        'Documents', 'Groceries', 'Loose Goods', 'Others'
      ];
      
      const isPlaceholder = (
        price === 0 && 
        stock === 0 && 
        !hasRealDescription &&
        placeholderCategories.includes(product.name)
      );
      
      const isActive = product.status === 'ACTIVE';
      
      return !isPlaceholder && isActive;
    });
    
    console.log('\n📊 FILTERED RESULTS (What you\'ll see in your dashboard):');
    console.log(`Total products after filtering: ${filteredProducts.length}`);
    
    filteredProducts.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.name}`);
      console.log(`   Price: ₹${product.mrp}`);
      console.log(`   Stock: ${product.quantity}`);
      console.log(`   Status: ${product.status}`);
      console.log(`   Description: ${product.description || 'No description'}`);
    });
    
  } catch (error) {
    console.error('Error testing filtered products:', error);
  }
}

// Run both tests
testShiprocketAPI().then(() => {
  testFilteredProducts();
});
