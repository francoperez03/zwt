import { useState } from 'react';
import Signup from './components/Signup';
import ProtectedView from './components/ProtectedView';
import { useIdentity } from './hooks/useIdentity';

function App() {
  const [view, setView] = useState<'signup' | 'protected'>('signup');
  const { identity } = useIdentity();

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>ZWT - Zero-Knowledge Token</h1>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setView('signup')} style={{ marginRight: '10px' }}>
          Signup
        </button>
        <button onClick={() => setView('protected')} disabled={!identity}>
          Protected View
        </button>
      </div>

      {view === 'signup' && <Signup />}
      {view === 'protected' && identity && <ProtectedView />}
    </div>
  );
}

export default App;
