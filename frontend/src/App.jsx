import { useEffect, useState } from 'react';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/health')
      .then(res => res.json())
      .then(data => setMessage(data.status))
      .catch(err => setMessage('Error fetching API'));
  }, []);

  return (
    <div>
      <h1>Data Analytics Dashboard</h1>
      <p>API status: {message}</p>
    </div>
  );
}

export default App;
