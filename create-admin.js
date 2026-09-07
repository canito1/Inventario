const axios = require('axios');

const API_URL = 'http://localhost:5000/api/auth';

async function createAdmin() {
    try {
        console.log('Creating Admin User...');
        const email = 'admin@inventory.com';
        const password = 'admin123';

        try {
            const registerResponse = await axios.post(`${API_URL}/register`, {
                name: 'Admin User',
                email,
                password,
                role: 'admin'
            });
            console.log('Admin created successfully:', registerResponse.data);
        } catch (error) {
            if (error.response && error.response.data.message === 'User already exists with this email') {
                console.log('Admin user already exists.');
            } else {
                console.error('Registration failed:', error.response ? error.response.data : error.message);
            }
        }

    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

createAdmin();
