import { useState } from 'react';
import axios from 'axios';
import { useIdentity } from '../hooks/useIdentity';
import { CheckCircle2, Copy, Check, User, Lock, Key } from 'lucide-react';

function Signup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const { identity, saveIdentity, clearIdentity } = useIdentity();

  const handleCreateAccount = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:3000/auth/signup');

      if (response.data.success) {
        saveIdentity(response.data.identity);
      }
    } catch (err) {
      setError('Failed to create account. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(field);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const truncate = (str: string, length: number = 20) => {
    if (str.length <= length) return str;
    return `${str.substring(0, length)}...`;
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>CREATE YOUR ACCOUNT</h1>
          <p style={styles.subtitle}>
            Get started with secure, private access to protected resources
          </p>
        </div>

        {/* Create Account Button (if no identity) */}
        {!identity && (
          <button
            onClick={handleCreateAccount}
            disabled={loading}
            style={{
              ...styles.createButton,
              ...(loading ? styles.createButtonDisabled : {}),
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 0 30px rgba(255, 255, 255, 0.7), 0 8px 24px rgba(0, 0, 0, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 255, 255, 0.5), 0 4px 16px rgba(0, 0, 0, 0.3)';
            }}
          >
            {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
          </button>
        )}

        {error && <div style={styles.error}>{error}</div>}

        {/* Account Created Success */}
        {identity && (
          <>
            {/* Success Banner */}
            <div style={styles.successBanner}>
              <CheckCircle2 style={styles.checkmark} />
              <span style={styles.successText}>ACCOUNT CREATED SUCCESSFULLY</span>
            </div>

            {/* Credentials Card */}
            <div style={styles.credentialsCard}>
              <h2 style={styles.cardTitle}>Your Credentials</h2>

              {/* Account ID */}
              <div style={styles.fieldGroup}>
                <div style={styles.labelRow}>
                  <span style={styles.label}>
                    <User size={16} style={styles.iconStyle} />
                    Account ID (Commitment)
                  </span>
                  <button
                    onClick={() => copyToClipboard(identity.commitment, 'commitment')}
                    style={styles.copyButton}
                    title="Copy to clipboard"
                  >
                    {copied === 'commitment' ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                <div style={styles.valueBox}>
                  <code style={styles.valueText}>{identity.commitment}</code>
                </div>
                <p style={styles.description}>
                  Your unique account identifier. This public ID proves you belong to the authorized group without revealing your identity.
                </p>
              </div>

              {/* Secure Key */}
              <div style={styles.fieldGroup}>
                <div style={styles.labelRow}>
                  <span style={styles.label}>
                    <Lock size={16} style={styles.iconStyle} />
                    Secure Key (Private Key)
                  </span>
                  <button
                    onClick={() => copyToClipboard(identity.privateKey, 'privateKey')}
                    style={styles.copyButton}
                    title="Copy to clipboard"
                  >
                    {copied === 'privateKey' ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                <div style={styles.valueBox}>
                  <code style={styles.valueText}>{identity.privateKey}</code>
                </div>
                <p style={styles.description}>
                  Your secret authentication key. Used to generate cryptographic proofs for secure access without exposing this key.
                </p>
                <div style={styles.warningBox}>
                  <Lock size={16} style={styles.warningIcon} />
                  <span style={styles.warningText}>
                    Keep this safe - never share with anyone. Anyone with this key can authenticate as you.
                  </span>
                </div>
              </div>

              {/* Session Token */}
              <div style={styles.fieldGroup}>
                <div style={styles.labelRow}>
                  <span style={styles.label}>
                    <Key size={16} style={styles.iconStyle} />
                    Session Token (Public Key)
                  </span>
                  <button
                    onClick={() => copyToClipboard(identity.publicKey, 'publicKey')}
                    style={styles.copyButton}
                    title="Copy to clipboard"
                  >
                    {copied === 'publicKey' ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                <div style={styles.valueBox}>
                  <code style={styles.valueText}>{identity.publicKey}</code>
                </div>
                <p style={styles.description}>
                  Public session identifier. Can be safely shared and is used alongside your proofs during authentication.
                </p>
              </div>

              {/* Clear Button */}
              <button onClick={clearIdentity} style={styles.clearButton}>
                Clear Account
              </button>
            </div>

            {/* How It Works */}
            <div style={styles.howItWorksCard}>
              <h2 style={styles.cardTitle}>How Your Account Works</h2>

              <div style={styles.stepContainer}>
                <div style={styles.step}>
                  <div style={styles.stepNumber}>1</div>
                  <div style={styles.stepContent}>
                    <h3 style={styles.stepTitle}>Automatic Login</h3>
                    <p style={styles.stepDescription}>
                      Your credentials are stored securely in your browser. No need to re-enter them each time.
                    </p>
                  </div>
                </div>

                <div style={styles.step}>
                  <div style={styles.stepNumber}>2</div>
                  <div style={styles.stepContent}>
                    <h3 style={styles.stepTitle}>Seamless Access</h3>
                    <p style={styles.stepDescription}>
                      When you access protected resources, you're automatically authenticated in the background.
                    </p>
                  </div>
                </div>

                <div style={styles.step}>
                  <div style={styles.stepNumber}>3</div>
                  <div style={styles.stepContent}>
                    <h3 style={styles.stepTitle}>Privacy Focused</h3>
                    <p style={styles.stepDescription}>
                      Your authentication is processed without tracking or storing your personal activity.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    padding: '40px 20px',
    fontFamily: "'Inter', 'Roboto', sans-serif",
  },
  content: {
    maxWidth: '700px',
    margin: '0 auto',
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '50px',
  },
  title: {
    fontSize: '48px',
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: '16px',
    letterSpacing: '2px',
    fontFamily: "'Rajdhani', 'Orbitron', sans-serif",
    textShadow: '0 0 30px rgba(255, 255, 255, 0.3)',
  },
  subtitle: {
    fontSize: '18px',
    color: '#a0a0a0',
    lineHeight: '1.6',
    maxWidth: '500px',
    margin: '0 auto',
  },
  createButton: {
    width: '100%',
    padding: '20px 40px',
    fontSize: '20px',
    fontWeight: '700',
    letterSpacing: '2px',
    color: '#ffffff',
    background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
    border: '2px solid #ffffff',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 0 20px rgba(255, 255, 255, 0.5), 0 4px 16px rgba(0, 0, 0, 0.3)',
    fontFamily: "'Rajdhani', sans-serif",
    textTransform: 'uppercase' as const,
  },
  createButtonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  error: {
    marginTop: '20px',
    padding: '16px',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid #ef4444',
    borderRadius: '8px',
    color: '#ef4444',
    textAlign: 'center' as const,
  },
  successBanner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '20px',
    background: 'rgba(74, 222, 128, 0.1)',
    border: '2px solid #4ade80',
    borderRadius: '8px',
    marginBottom: '30px',
    boxShadow: '0 0 20px rgba(74, 222, 128, 0.2)',
  },
  checkmark: {
    color: '#4ade80',
    width: '24px',
    height: '24px',
  },
  successText: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#4ade80',
    letterSpacing: '1px',
    fontFamily: "'Rajdhani', sans-serif",
  },
  credentialsCard: {
    background: 'rgba(26, 26, 26, 0.95)',
    border: '1px solid #333333',
    borderRadius: '12px',
    padding: '32px',
    marginBottom: '30px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(10px)',
  },
  cardTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: '30px',
    fontFamily: "'Rajdhani', sans-serif",
    letterSpacing: '1px',
  },
  fieldGroup: {
    marginBottom: '28px',
  },
  labelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#ffffff',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  iconStyle: {
    flexShrink: 0,
  },
  copyButton: {
    background: 'transparent',
    border: '1px solid #555555',
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '16px',
    color: '#a0a0a0',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  valueBox: {
    background: '#0a0a0a',
    border: '1px solid #333333',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '8px',
    overflowX: 'auto' as const,
  },
  valueText: {
    fontFamily: "'Fira Code', 'Courier New', monospace",
    fontSize: '13px',
    color: '#00ffff',
    wordBreak: 'break-all' as const,
    display: 'block',
  },
  description: {
    fontSize: '13px',
    color: '#666666',
    margin: '0',
    fontStyle: 'italic' as const,
  },
  warningBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    padding: '12px',
    background: 'rgba(251, 191, 36, 0.05)',
    border: '1px solid rgba(251, 191, 36, 0.3)',
    borderRadius: '6px',
  },
  warningIcon: {
    flexShrink: 0,
    color: '#fbbf24',
  },
  warningText: {
    fontSize: '13px',
    color: '#fbbf24',
    lineHeight: '1.5',
  },
  clearButton: {
    marginTop: '20px',
    padding: '12px 24px',
    background: 'transparent',
    border: '1px solid #555555',
    borderRadius: '6px',
    color: '#a0a0a0',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: "'Rajdhani', sans-serif",
    letterSpacing: '0.5px',
  },
  howItWorksCard: {
    background: 'rgba(26, 26, 26, 0.95)',
    border: '1px solid #333333',
    borderRadius: '12px',
    padding: '32px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(10px)',
  },
  stepContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px',
  },
  step: {
    display: 'flex',
    gap: '20px',
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: '48px',
    height: '48px',
    flexShrink: 0,
    background: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: '800',
    color: '#0a0a0a',
    fontFamily: "'Rajdhani', sans-serif",
    boxShadow: '0 4px 12px rgba(255, 255, 255, 0.4)',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '8px',
    fontFamily: "'Rajdhani', sans-serif",
  },
  stepDescription: {
    fontSize: '15px',
    color: '#a0a0a0',
    lineHeight: '1.6',
    margin: '0',
  },
};

export default Signup;
