import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useIdentity } from '../hooks/useIdentity';
import { buildAccessContext, generateProof } from 'zwt-access-lib';
import { User, Users, Key, Lock, CheckCircle2, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';

function ProtectedView() {
  const { identity } = useIdentity();
  const [groupMembers, setGroupMembers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [reregistering, setReregistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [proofData, setProofData] = useState<any>(null);
  const [responseData, setResponseData] = useState<any>(null);
  const [showProofDetails, setShowProofDetails] = useState(false);

  const targetUrl = '/protected/view';
  const scope = 'default';
  const epochDuration = 3600000; // 1 hour

  const accessContext = useMemo(() => {
    if (!identity) return null;
    return buildAccessContext(targetUrl, scope, epochDuration);
  }, [identity]);

  useEffect(() => {
    // Fetch group members on mount
    axios.get('http://localhost:3000/auth/group-members')
      .then(res => {
        setGroupMembers(res.data.members || []);
      })
      .catch(err => {
        console.error('Failed to fetch group members:', err);
        setError('Failed to load group members');
      });
  }, []);

  const handleAccessProtectedResource = async () => {
    if (!identity || groupMembers.length === 0 || !isInGroup) {
      setError('Cannot generate proof. Check identity and group membership.');
      return;
    }

    if (!accessContext) {
      setError('Access context not ready.');
      return;
    }

    setLoading(true);
    setError(null);
    setProofData(null);
    setResponseData(null);
    console.log('accessContext', accessContext);
    try {
      // Step 1: Generate proof manually
      console.log('Generating proof...', {
        identity,
        groupMembers,
        signal: accessContext.signal,
        externalNullifier: accessContext.externalNullifier
      });
      const proof = await generateProof({
        identity,
        groupMembers,
        signal: accessContext.signal,
        externalNullifier: accessContext.externalNullifier
      });

      setProofData(proof);

      // Step 2: Make request with proof in header
      const response = await axios.get(`http://localhost:3000${targetUrl}`, {
        headers: {
          'X-ZWT-TOKEN': JSON.stringify(proof)
        }
      });

      setResponseData({
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });
    } catch (err: any) {
      console.log('------error------', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to access protected resource';
      setError(errorMessage);
      console.error('Access error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReregister = async () => {
    if (!identity) {
      setError('No identity to re-register');
      return;
    }

    setReregistering(true);
    setError(null);

    try {
      // Call signup endpoint to re-register the current identity's commitment
      await axios.post('http://localhost:3000/auth/signup');

      // Refresh group members
      const response = await axios.get('http://localhost:3000/auth/group-members');
      setGroupMembers(response.data.members || []);

      setError(null);
    } catch (err: any) {
      setError('Failed to re-register identity: ' + (err.message || 'Unknown error'));
      console.error('Re-register error:', err);
    } finally {
      setReregistering(false);
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

  const isInGroup = useMemo(() => {
    if (!identity || groupMembers.length === 0) return false;
    return groupMembers.includes(identity.commitment);
  }, [identity, groupMembers]);

  const canAccess = !!identity && groupMembers.length > 0 && isInGroup;

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>ACCESS PROTECTED RESOURCE</h1>
          <p style={styles.subtitle}>
            Generate cryptographic proof and access secure endpoints
          </p>
        </div>

        {/* Section 1: Preparation Panel */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Available Elements for Authentication</h2>

          <div style={styles.elementGroup}>
            <div style={styles.elementRow}>
              <div style={styles.elementLabel}>
                <User size={16} style={styles.iconStyle} />
                Your Identity
              </div>
              <div style={styles.elementValue}>
                {identity ? (
                  <span style={styles.statusActive}>✓ Loaded</span>
                ) : (
                  <span style={styles.statusInactive}>✗ Not Found</span>
                )}
              </div>
            </div>
            {identity && (
              <>
                <div style={styles.elementDetail}>
                  Account ID: {identity.commitment.substring(0, 20)}...
                </div>
                {groupMembers.length > 0 && (
                  <div style={styles.elementDetail}>
                    Group Membership: {isInGroup ? (
                      <span style={styles.statusActive}>✓ In Group</span>
                    ) : (
                      <span style={styles.statusInactive}>✗ Not in Group</span>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          <div style={styles.elementGroup}>
            <div style={styles.elementRow}>
              <div style={styles.elementLabel}>
                <Users size={16} style={styles.iconStyle} />
                Group Members
              </div>
              <div style={styles.elementValue}>
                {groupMembers.length > 0 ? (
                  <span style={styles.statusActive}>✓ {groupMembers.length} Members</span>
                ) : (
                  <span style={styles.statusInactive}>⟳ Loading...</span>
                )}
              </div>
            </div>
            {groupMembers.length > 0 && (
              <div style={styles.elementDetail}>
                Group tree contains {groupMembers.length} authorized identit{groupMembers.length === 1 ? 'y' : 'ies'}
              </div>
            )}
          </div>

          <div style={styles.elementGroup}>
            <div style={styles.elementRow}>
              <div style={styles.elementLabel}>
                <Key size={16} style={styles.iconStyle} />
                Target Resource
              </div>
              <div style={styles.elementValue}>
                <code style={styles.codeText}>{targetUrl}</code>
              </div>
            </div>
            <div style={styles.elementDetail}>
              Protected endpoint requiring authentication proof
            </div>
          </div>

          {accessContext && (
            <>
              <div style={styles.elementGroup}>
                <div style={styles.elementRow}>
                  <div style={styles.elementLabel}>
                    <Lock size={16} style={styles.iconStyle} />
                    External Nullifier
                  </div>
                  <div style={styles.elementValue}>
                    <code style={styles.codeText}>
                      {accessContext.externalNullifier.substring(0, 30)}...
                    </code>
                  </div>
                </div>
                <div style={styles.elementDetail}>
                  Time-based scope preventing replay attacks
                </div>
              </div>

              <div style={styles.elementGroup}>
                <div style={styles.elementRow}>
                  <div style={styles.elementLabel}>
                    <Key size={16} style={styles.iconStyle} />
                    Signal
                  </div>
                  <div style={styles.elementValue}>
                    <code style={styles.codeText}>
                      {accessContext.signal.substring(0, 30)}...
                    </code>
                  </div>
                </div>
                <div style={styles.elementDetail}>
                  Message bound to the authentication proof
                </div>
              </div>
            </>
          )}
        </div>

        {/* Section 2: Generate & Execute Request */}
        <button
          onClick={handleAccessProtectedResource}
          disabled={loading || !canAccess}
          style={{
            ...styles.accessButton,
            ...(loading || !canAccess ? styles.accessButtonDisabled : {}),
          }}
          onMouseEnter={(e) => {
            if (!loading && canAccess) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(255, 255, 255, 0.7), 0 8px 24px rgba(0, 0, 0, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 255, 255, 0.5), 0 4px 16px rgba(0, 0, 0, 0.3)';
          }}
        >
          {loading ? 'GENERATING PROOF & ACCESSING...' : 'GENERATE PROOF & ACCESS RESOURCE'}
        </button>

        {!canAccess && !loading && (
          <div style={styles.warningBox}>
            <Lock size={16} style={styles.warningIcon} />
            <span style={styles.warningText}>
              {!identity
                ? 'You need to create an identity first.'
                : groupMembers.length === 0
                  ? 'Waiting for group members to load...'
                  : !isInGroup
                    ? 'Your identity is not in the authorized group. The commitment registered on signup may not match or may have been cleared from the server.'
                    : 'Cannot access resource.'}
            </span>
          </div>
        )}

        {/* Re-register button when identity exists but not in group */}
        {identity && groupMembers.length > 0 && !isInGroup && !loading && (
          <button
            onClick={handleReregister}
            disabled={reregistering}
            style={{
              ...styles.reregisterButton,
              ...(reregistering ? styles.reregisterButtonDisabled : {}),
            }}
            onMouseEnter={(e) => {
              if (!reregistering) {
                e.currentTarget.style.borderColor = '#ffffff';
                e.currentTarget.style.color = '#ffffff';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#fbbf24';
              e.currentTarget.style.color = '#fbbf24';
            }}
          >
            {reregistering ? 'RE-REGISTERING...' : 'RE-REGISTER IDENTITY'}
          </button>
        )}

        {error && (
          <div style={styles.errorBox}>
            <span style={styles.errorText}>{error}</span>
          </div>
        )}

        {/* Proof Display */}
        {proofData && (
          <div style={styles.card}>
            <div style={styles.cardTitleRow}>
              <h2 style={styles.cardTitle}>Generated Proof Header</h2>
              <button
                onClick={() => copyToClipboard(JSON.stringify(proofData, null, 2), 'proof')}
                style={styles.copyButton}
                title="Copy proof"
              >
                {copied === 'proof' ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>

            <div style={styles.proofSection}>
              <div style={styles.proofField}>
                <span style={styles.proofLabel}>Header Name:</span>
                <code style={styles.proofValue}>X-ZWT-TOKEN</code>
              </div>

              <div style={styles.proofField}>
                <span style={styles.proofLabel}>Nullifier Hash:</span>
                <code style={styles.proofValue}>{proofData.nullifierHash}</code>
              </div>

              <div style={styles.proofField}>
                <span style={styles.proofLabel}>External Nullifier:</span>
                <code style={styles.proofValue}>{proofData.externalNullifier}</code>
              </div>

              <div style={styles.proofField}>
                <span style={styles.proofLabel}>Signal:</span>
                <code style={styles.proofValue}>{proofData.signal}</code>
              </div>

              <div style={styles.proofField}>
                <button
                  onClick={() => setShowProofDetails(!showProofDetails)}
                  style={styles.toggleButton}
                >
                  <span>Proof Object (ZK Proof)</span>
                  {showProofDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>

              {showProofDetails && (
                <div style={styles.proofObjectBox}>
                  <pre style={styles.proofObjectText}>
                    {JSON.stringify(proofData.proof, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Section 3: Response Display */}
        {responseData && (
          <>
            <div style={styles.successBanner}>
              <CheckCircle2 style={styles.checkmark} />
              <span style={styles.successText}>ACCESS GRANTED</span>
            </div>

            <div style={styles.card}>
              <div style={styles.cardTitleRow}>
                <h2 style={styles.cardTitle}>Protected Resource Response</h2>
                <button
                  onClick={() => copyToClipboard(JSON.stringify(responseData.data, null, 2), 'response')}
                  style={styles.copyButton}
                  title="Copy response"
                >
                  {copied === 'response' ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>

              <div style={styles.responseInfo}>
                <div style={styles.responseBadge}>
                  {responseData.status} {responseData.statusText}
                </div>
              </div>

              <div style={styles.responseDataBox}>
                <pre style={styles.responseDataText}>
                  {JSON.stringify(responseData.data, null, 2)}
                </pre>
              </div>

              <p style={styles.successDescription}>
                You successfully accessed the protected resource without revealing your specific identity.
                The server verified your proof and confirmed you belong to the authorized group.
              </p>
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
    maxWidth: '900px',
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
    maxWidth: '600px',
    margin: '0 auto',
  },
  card: {
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
  cardTitleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  },
  elementGroup: {
    marginBottom: '24px',
    paddingBottom: '24px',
    borderBottom: '1px solid #333333',
  },
  elementRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  elementLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#ffffff',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  elementValue: {
    fontSize: '14px',
    color: '#a0a0a0',
  },
  elementDetail: {
    fontSize: '13px',
    color: '#666666',
    fontStyle: 'italic' as const,
    marginTop: '4px',
    marginLeft: '24px',
  },
  iconStyle: {
    flexShrink: 0,
  },
  statusActive: {
    color: '#4ade80',
    fontWeight: '600',
  },
  statusInactive: {
    color: '#ef4444',
    fontWeight: '600',
  },
  codeText: {
    fontFamily: "'Fira Code', 'Courier New', monospace",
    fontSize: '12px',
    color: '#00ffff',
    background: '#0a0a0a',
    padding: '4px 8px',
    borderRadius: '4px',
  },
  accessButton: {
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
    marginBottom: '20px',
  },
  accessButtonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  reregisterButton: {
    width: '100%',
    padding: '16px 32px',
    fontSize: '16px',
    fontWeight: '700',
    letterSpacing: '1.5px',
    color: '#fbbf24',
    background: 'transparent',
    border: '2px solid #fbbf24',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    fontFamily: "'Rajdhani', sans-serif",
    textTransform: 'uppercase' as const,
    marginBottom: '20px',
  },
  reregisterButtonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  warningBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    padding: '12px',
    background: 'rgba(251, 191, 36, 0.05)',
    border: '1px solid rgba(251, 191, 36, 0.3)',
    borderRadius: '6px',
    marginBottom: '20px',
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
  errorBox: {
    padding: '16px',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid #ef4444',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  errorText: {
    color: '#ef4444',
    fontSize: '14px',
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
  proofSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  proofField: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  proofLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#a0a0a0',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  proofValue: {
    fontFamily: "'Fira Code', 'Courier New', monospace",
    fontSize: '13px',
    color: '#00ffff',
    background: '#0a0a0a',
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #333333',
    wordBreak: 'break-all' as const,
    display: 'block',
  },
  toggleButton: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: '12px',
    background: 'transparent',
    border: '1px solid #555555',
    borderRadius: '6px',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: "'Rajdhani', sans-serif",
    letterSpacing: '0.5px',
  },
  proofObjectBox: {
    background: '#0a0a0a',
    border: '1px solid #333333',
    borderRadius: '6px',
    padding: '16px',
    maxHeight: '400px',
    overflowY: 'auto' as const,
  },
  proofObjectText: {
    fontFamily: "'Fira Code', 'Courier New', monospace",
    fontSize: '12px',
    color: '#00ffff',
    margin: '0',
    wordBreak: 'break-all' as const,
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
  responseInfo: {
    marginBottom: '20px',
  },
  responseBadge: {
    display: 'inline-block',
    padding: '8px 16px',
    background: '#4ade80',
    color: '#0a0a0a',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '700',
    fontFamily: "'Rajdhani', sans-serif",
    letterSpacing: '0.5px',
  },
  responseDataBox: {
    background: '#0a0a0a',
    border: '1px solid #333333',
    borderRadius: '6px',
    padding: '16px',
    marginBottom: '20px',
    maxHeight: '400px',
    overflowY: 'auto' as const,
  },
  responseDataText: {
    fontFamily: "'Fira Code', 'Courier New', monospace",
    fontSize: '13px',
    color: '#00ffff',
    margin: '0',
    wordBreak: 'break-all' as const,
  },
  successDescription: {
    fontSize: '14px',
    color: '#a0a0a0',
    lineHeight: '1.6',
    fontStyle: 'italic' as const,
    margin: '0',
  },
};

export default ProtectedView;
