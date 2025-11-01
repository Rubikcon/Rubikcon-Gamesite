// Simple test script to verify crypto payment functionality
const fetch = require('node-fetch');

async function testCryptoPayment() {
  const baseUrl = 'http://localhost:5000';
  
  try {
    console.log('🧪 Testing crypto payment functionality...\n');
    
    // 1. Test crypto rates endpoint
    console.log('1. Testing crypto rates...');
    const ratesResponse = await fetch(`${baseUrl}/api/crypto-rates`);
    const rates = await ratesResponse.json();
    console.log('✅ Crypto rates:', rates);
    
    // 2. Test games endpoint
    console.log('\n2. Testing games endpoint...');
    const gamesResponse = await fetch(`${baseUrl}/api/games`);
    const games = await gamesResponse.json();
    console.log('✅ Games loaded:', games.length, 'games');
    
    // 3. Test crypto payment initialization
    console.log('\n3. Testing crypto payment initialization...');
    const orderData = {
      customerInfo: {
        fullName: 'Test User',
        email: 'test@example.com',
        phone: '+1234567890',
        address: 'Test Address',
        country: 'Global',
        state: 'Blockchain'
      },
      items: [{
        gameId: 1,
        title: 'Crypto Charades',
        price: 100,
        quantity: 1
      }],
      total: 100
    };
    
    const initResponse = await fetch(`${baseUrl}/api/payment/crypto/initialize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderData,
        currency: 'ETH',
        network: 'ethereum'
      })
    });
    
    if (initResponse.ok) {
      const initResult = await initResponse.json();
      console.log('✅ Crypto payment initialized:', initResult);
      
      // 4. Test verification (with dummy hash)
      console.log('\n4. Testing crypto verification...');
      const verifyResponse = await fetch(`${baseUrl}/api/payment/crypto/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          txHash: '0x1234567890abcdef',
          transactionId: 'test-tx-id'
        })
      });
      
      if (verifyResponse.ok) {
        const verifyResult = await verifyResponse.json();
        console.log('✅ Crypto verification:', verifyResult);
      } else {
        console.log('❌ Verification failed:', await verifyResponse.text());
      }
    } else {
      console.log('❌ Initialization failed:', await initResponse.text());
    }
    
    console.log('\n🎉 Crypto payment test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testCryptoPayment();