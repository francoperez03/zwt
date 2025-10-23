import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useIdentity } from '../hooks/useIdentity';
import { setupSemaphoreInterceptor } from '../apiClient';

function ProtectedView() {
  const { identity } = useIdentity();
  const [groupMembers, setGroupMembers] = useState<string[]>([]);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios.get('http://localhost:3000/auth/group-members')
      .then(res => setGroupMembers(res.data.members))
      .catch(err => console.error('Failed to fetch group members:', err));
  }, []);

  const api = useMemo(() => {
    if (identity && groupMembers.length > 0) {
      return setupSemaphoreInterceptor({
        identity,
        groupMembers
      });
    }
    return null;
  }, [identity, groupMembers]);

  const fetchProtectedData = async () => {
    if (!api) {
      setError('API client not ready');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/protected/view');
      setData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch protected data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Protected View</h2>
      <p>This requires a valid Semaphore proof</p>

      <button onClick={fetchProtectedData} disabled={loading || !api}>
        {loading ? 'Generating Proof & Fetching...' : 'Fetch Protected Data'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {data && (
        <div style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0' }}>
          <h3>Protected Data:</h3>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default ProtectedView;
