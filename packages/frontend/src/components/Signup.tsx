import { useState } from 'react';
import axios from 'axios';
import { useIdentity } from '../hooks/useIdentity';

function Signup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { identity, saveIdentity, clearIdentity } = useIdentity();

  const handleSignup = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:3000/auth/signup');

      if (response.data.success) {
        saveIdentity(response.data.identity);
      }
    } catch (err) {
      setError('Signup failed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Signup</h2>

      {identity ? (
        <div>
          <p style={{ color: 'green' }}>✓ Identity created and saved</p>
          <p><strong>Commitment:</strong> {identity.commitment.substring(0, 20)}...</p>
          <button onClick={clearIdentity}>Clear Identity</button>
        </div>
      ) : (
        <div>
          <p>Create a new anonymous identity</p>
          <button onClick={handleSignup} disabled={loading}>
            {loading ? 'Creating...' : 'Create Identity'}
          </button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
      )}
    </div>
  );
}

export default Signup;
