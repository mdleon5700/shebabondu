async function testAuth() {
  const base = 'http://localhost:3000';
  
  console.log('--- 1. Testing Admin PIN Login ---');
  try {
    const resAdmin = await fetch(base + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'admin', adminPin: '1234' })
    });
    console.log('Admin login status:', resAdmin.status, await resAdmin.json());
  } catch (e: any) {
    console.error('Admin error:', e.message);
  }

  console.log('\n--- 2. Testing Candidate Demo Login ---');
  try {
    const resCand = await fetch(base + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: '01712-345678', password: '123456', role: 'candidate' })
    });
    console.log('Candidate login status:', resCand.status, await resCand.json());
  } catch (e: any) {
    console.error('Cand error:', e.message);
  }

  console.log('\n--- 3. Testing Candidate Register ---');
  const testPhone = '01889' + Math.floor(100000 + Math.random() * 900000);
  try {
    const resReg = await fetch(base + '/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'পরীক্ষার্থী', phone: testPhone, password: 'password123', district: 'ঢাকা' })
    });
    console.log('Candidate register status:', resReg.status, await resReg.json());
  } catch (e: any) {
    console.error('Reg error:', e.message);
  }

  console.log('\n--- 4. Testing Forgot Password Request OTP ---');
  try {
    const resForgot = await fetch(base + '/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'request_otp', identifier: '01712-345678' })
    });
    console.log('Forgot password status:', resForgot.status, await resForgot.json());
  } catch (e: any) {
    console.error('Forgot error:', e.message);
  }

  console.log('\n--- 5. Testing Social Auth ---');
  try {
    const resSocial = await fetch(base + '/api/auth/social', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: 'google', email: 'tanvir.jobseeker@gmail.com', name: 'মোঃ তানভীর হাসান' })
    });
    console.log('Social auth status:', resSocial.status, await resSocial.json());
  } catch (e: any) {
    console.error('Social error:', e.message);
  }
}

testAuth();

