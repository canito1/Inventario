const axios = require('axios');

const API_URL = 'http://localhost:5000/api/auth';

async function testAdminLogin() {
    try {
        console.log('Testing Admin Login...');
        const email = 'admin@inventory.com';
        const password = 'admin123';

        try {
            const loginResponse = await axios.post(`${API_URL}/login`, {
                email,
                password
            });
            console.log('Admin Login successful:', loginResponse.data);
        } catch (error) {
            console.error('Admin Login failed:', error.response ? error.response.data : error.message);
        }

    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

testAdminLogin();
