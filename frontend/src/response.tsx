import axios from 'axios';

axios.get('http://localhost:5000/api/suppliers')
.then(response => {
    const suppliers = response.data;
    // Process the retrieved supplier data in your frontend
  })
  .catch(error => {
    // Handle any errors
  });