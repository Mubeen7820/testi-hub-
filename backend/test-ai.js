const axios = require('axios');

async function test() {
  try {
    const response = await axios.post('http://localhost:5000/api/ai/extract', {
      image: 'Hello, this is a beautiful Testimonial-Hub application!',
      mimeType: 'text/plain'
    });
    console.log('Success:', response.data);
  } catch (err) {
    if (err.response) {
      console.error('API Error:', err.response.status, err.response.data);
    } else {
      console.error('Network Error:', err.message);
    }
  }
}

test();
