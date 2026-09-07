const axios = require('axios');

const API_URL = 'http://localhost:5000/api/auth';

async function testAuth() {
    try {
        console.log('Testing Registration...');
        const email = `test${Date.now()}@example.com`;
        const password = 'password123';

        try {
            const registerResponse = await axios.post(`${API_URL}/register`, {
                name: 'Test User',
                email,
                password
            });
            console.log('Registration successful:', registerResponse.data);
        } catch (error) {
            console.error('Registration failed:', error.response ? error.response.data : error.message);
        }

        console.log('\nTesting Login...');
        try {
            const loginResponse = await axios.post(`${API_URL}/login`, {
                email,
                password
            });
            console.log('Login successful:', loginResponse.data);
        } catch (error) {
            console.error('Login failed:', error.response ? error.response.data : error.message);
        }

    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

testAuth();
