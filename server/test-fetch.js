async function main() {
  // Login
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber: '770000000', password: 'adminpassword123' })
  });
  const loginData = await loginRes.json();
  
  if (!loginData.token) {
    console.error('Login failed:', loginData);
    return;
  }
  console.log('Login success!');

  // Fetch reservations
  const res = await fetch('http://localhost:5000/api/reservations/all', {
    headers: { 'Authorization': `Bearer ${loginData.token}` }
  });
  const data = await res.json();
  console.log('Reservations fetched:', data);
}

main().catch(console.error);
