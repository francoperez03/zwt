import { useEffect, useRef, useState } from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import CodeBlock from '@theme/CodeBlock';
import styles from './index.module.css';

// ASCII animation component for ZWT
function ASCIIHero() {
  const [displayText, setDisplayText] = useState(['Z', 'W', 'T']);
  const [isAnimating, setIsAnimating] = useState(true);
  const animationFrame = useRef(0);

  useEffect(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*';
    const targetText = ['Z', 'W', 'T'];

    const interval = setInterval(() => {
      if (!isAnimating) return;

      animationFrame.current++;

      setDisplayText(prev => prev.map((char, i) => {
        if (Math.random() > 0.85) {
          return chars[Math.floor(Math.random() * chars.length)];
        }
        if (animationFrame.current > 30 && Math.random() > 0.7) {
          return targetText[i];
        }
        return char;
      }));

      if (animationFrame.current > 60) {
        setDisplayText(targetText);
        setIsAnimating(false);
        animationFrame.current = 0;
        setTimeout(() => setIsAnimating(true), 3000);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isAnimating]);

  return (
    <div className={styles.asciiHero}>
      <div className={styles.crtEffect}>
        <div className={styles.scanlines}></div>
        <div className={styles.asciiText}>
          {displayText.map((char, i) => (
            <span
              key={i}
              className={styles.asciiChar}
              style={{
                animationDelay: `${i * 0.1}s`,
                color: `hsl(${210 + i * 10}, ${50 + i * 10}%, ${60 + i * 5}%)`
              }}
            >
              {char}
            </span>
          ))}
        </div>
        <div className={styles.subtitle}>Zero Knowledge Web Token</div>
      </div>
    </div>
  );
}

// Terminal-style installation animation
function InstallAnimation() {
  const [lines, setLines] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(true);
  const [currentCommand, setCurrentCommand] = useState('');
  const [showRunning, setShowRunning] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    const command = 'npm install zwt-access-lib';
    let charIndex = 0;
    let typingInterval: NodeJS.Timeout;

    const runAnimation = () => {
      // Reset state
      setLines([]);
      setIsTyping(true);
      setCurrentCommand('');
      setShowRunning(false);
      charIndex = 0;

      // Type the command character by character
      typingInterval = setInterval(() => {
        if (charIndex < command.length) {
          setCurrentCommand(command.substring(0, charIndex + 1));
          charIndex++;
        } else {
          clearInterval(typingInterval);
          setIsTyping(false);

          // Wait a bit, then "press enter" and show it's running
          setTimeout(() => {
            setShowRunning(true);

            // Start the installation sequence after pressing enter
            setTimeout(() => {
              const sequence = [
                { text: '$ ' + command, delay: 0 },
                { text: '', delay: 100 },
                { text: 'added 1 package, and audited 2 packages in 847ms', delay: 900 },
                { text: '', delay: 950 },
                { text: '1 package is looking for funding', delay: 1000 },
                { text: '  run `npm fund` for details', delay: 1050 },
                { text: '', delay: 1100 },
                { text: 'found 0 vulnerabilities', delay: 1600 }
              ];

              const timeouts: NodeJS.Timeout[] = [];

              sequence.forEach((item, index) => {
                const timeout = setTimeout(() => {
                  setLines(prev => [...prev, item.text]);

                  // After the last line, wait 8 seconds then restart
                  if (index === sequence.length - 1) {
                    setTimeout(() => {
                      setAnimationKey(prev => prev + 1);
                    }, 8000);
                  }
                }, item.delay);
                timeouts.push(timeout);
              });

              return () => timeouts.forEach(clearTimeout);
            }, 100);
          }, 800);
        }
      }, 80);
    };

    runAnimation();

    return () => {
      if (typingInterval) clearInterval(typingInterval);
    };
  }, [animationKey]);

  return (
    <div className={styles.terminalBox}>
      <div className={styles.terminalHeader}>
        <span className={styles.terminalDot} style={{background: '#ff5f56'}}></span>
        <span className={styles.terminalDot} style={{background: '#ffbd2e'}}></span>
        <span className={styles.terminalDot} style={{background: '#27c93f'}}></span>
        <span className={styles.terminalTitle}>terminal</span>
      </div>
      <div className={styles.terminalContent}>
        {!showRunning && (
          <div className={styles.terminalLine}>
            <span className={styles.terminalPrompt}>$</span> {currentCommand}
            {isTyping && <span className={styles.cursor}>▌</span>}
          </div>
        )}
        {lines.map((line, i) => (
          <div key={i} className={styles.terminalLine}>
            {line}
          </div>
        ))}
        {lines.length > 0 && lines.length >= 7 && (
          <div className={styles.terminalLine}>
            <span className={styles.terminalPrompt}>$</span>
            <span className={styles.cursor}>▌</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();

  return (
    <Layout
      title="Home"
      description="Zero Knowledge Web Token - Anonymous Authentication Made Simple"
      wrapperClassName="homepage-wrapper">

      {/* 1. Hero */}
      <ASCIIHero />

      <main>
        {/* 2. Value Proposition */}
        <section className={styles.valueSection}>
          <div className="container">
            <div className={styles.valueContent}>
              <h1 className={styles.headline}>
                Private Authentication Made Simple
              </h1>
              <p className={styles.tagline}>
                Replace traditional credentials with zero-knowledge proofs. Three lines of code.
                No user tracking. Complete privacy.
              </p>

              <div className={styles.ctaButtons}>
                <Link
                  className="button button--primary button--lg"
                  to="/docs/getting-started/quick-start">
                  Get Started →
                </Link>
                <a
                  className="button button--outline button--secondary button--lg"
                  href="http://localhost:5173"
                  target="_blank"
                  rel="noopener noreferrer">
                  Try Live Demo
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Problem/Solution Section (NEW) */}
        <section className={styles.problemSolution}>
          <div className="container">
            <h2 className={styles.sectionTitle}>Authentication Without Surveillance</h2>
            <p className={styles.problemSubtitle}>
              Traditional auth systems force a choice between security and privacy. ZWT eliminates that trade-off.
            </p>

            <div className={styles.comparisonContainer}>
              <div className={styles.comparisonSide}>
                <div className={styles.comparisonBadge} data-type="problem">Traditional Auth</div>

                <div className={styles.metricBoxes}>
                  <div className={styles.metricBox} data-type="problem">
                    <div className={styles.metricIcon}>📊</div>
                    <div className={styles.metricContent}>
                      <div className={styles.metricLabel}>User Data Stored</div>
                      <div className={styles.metricValue}>Emails, IPs, Sessions</div>
                    </div>
                  </div>

                  <div className={styles.metricBox} data-type="problem">
                    <div className={styles.metricIcon}>🎯</div>
                    <div className={styles.metricContent}>
                      <div className={styles.metricLabel}>Tracking Level</div>
                      <div className={styles.metricValue}>Every Request Logged</div>
                    </div>
                  </div>

                  <div className={styles.metricBox} data-type="problem">
                    <div className={styles.metricIcon}>⚖️</div>
                    <div className={styles.metricContent}>
                      <div className={styles.metricLabel}>Compliance Burden</div>
                      <div className={styles.metricValue}>GDPR, CCPA, HIPAA</div>
                    </div>
                  </div>

                  <div className={styles.metricBox} data-type="problem">
                    <div className={styles.metricIcon}>🎯</div>
                    <div className={styles.metricContent}>
                      <div className={styles.metricLabel}>Breach Risk</div>
                      <div className={styles.metricValue}>High-Value Target</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.comparisonDivider}>
                <div className={styles.dividerLine}></div>
                <div className={styles.dividerIcon}>→</div>
                <div className={styles.dividerLine}></div>
              </div>

              <div className={styles.comparisonSide}>
                <div className={styles.comparisonBadge} data-type="solution">Zero-Knowledge Auth</div>

                <div className={styles.metricBoxes}>
                  <div className={styles.metricBox} data-type="solution">
                    <div className={styles.metricIcon}>🔐</div>
                    <div className={styles.metricContent}>
                      <div className={styles.metricLabel}>User Data Stored</div>
                      <div className={styles.metricValue}>Zero PII</div>
                    </div>
                  </div>

                  <div className={styles.metricBox} data-type="solution">
                    <div className={styles.metricIcon}>👻</div>
                    <div className={styles.metricContent}>
                      <div className={styles.metricLabel}>Tracking Level</div>
                      <div className={styles.metricValue}>Cryptographically Impossible</div>
                    </div>
                  </div>

                  <div className={styles.metricBox} data-type="solution">
                    <div className={styles.metricIcon}>✅</div>
                    <div className={styles.metricContent}>
                      <div className={styles.metricLabel}>Compliance Burden</div>
                      <div className={styles.metricValue}>Privacy by Design</div>
                    </div>
                  </div>

                  <div className={styles.metricBox} data-type="solution">
                    <div className={styles.metricIcon}>🛡️</div>
                    <div className={styles.metricContent}>
                      <div className={styles.metricLabel}>Breach Risk</div>
                      <div className={styles.metricValue}>Nothing to Steal</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.statsBar}>
              <div className={styles.statBox}>
                <div className={styles.statNumber}>0</div>
                <div className={styles.statLabel}>PII Stored</div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statNumber}>0</div>
                <div className={styles.statLabel}>Session Tracking</div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statNumber}>100%</div>
                <div className={styles.statLabel}>Privacy Guaranteed</div>
              </div>
            </div>

            <div className={styles.problemCta}>
              <p className={styles.problemCtaText}>
                For CTOs: Reduce your attack surface, eliminate PII storage liability, and build user trust through cryptographic guarantees—not policies.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Use Cases (MOVED) */}
        <section className={styles.useCases}>
          <div className="container">
            <h2 className={styles.sectionTitle}>Perfect For</h2>

            <div className={styles.useCaseGrid}>
              <div className={styles.useCase}>
                <h3>🗳️ Anonymous Voting</h3>
                <p>
                  Verified members vote without revealing identity or choices.
                  Prevent double-voting with epochs.
                </p>
              </div>

              <div className={styles.useCase}>
                <h3>💬 Private Communities</h3>
                <p>
                  Members interact without exposing real identities while
                  maintaining group accountability.
                </p>
              </div>

              <div className={styles.useCase}>
                <h3>🔔 Whistleblowing</h3>
                <p>
                  Employees report issues anonymously while proving they're
                  legitimate company members.
                </p>
              </div>

              <div className={styles.useCase}>
                <h3>🎫 Token-Gated Access</h3>
                <p>
                  NFT or token holders access exclusive content without revealing
                  wallet addresses.
                </p>
              </div>

              <div className={styles.useCase}>
                <h3>📊 Private Analytics</h3>
                <p>
                  Collect usage data without tracking individual users. Privacy-first
                  metrics and telemetry.
                </p>
              </div>

              <div className={styles.useCase}>
                <h3>🔐 Sensitive Resources</h3>
                <p>
                  Protect sensitive APIs and documents with anonymous access control
                  and audit trails.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. How It Works (MOVED) */}
        <section className={styles.howItWorks}>
          <div className="container">
            <h2 className={styles.sectionTitle}>How It Works</h2>

            <div className={styles.steps}>
              <div className={styles.step}>
                <div className={styles.stepNumber}>1</div>
                <h3>Create Identity</h3>
                <p>
                  Generate a cryptographic identity locally. Your private key never
                  leaves your device.
                </p>
              </div>

              <div className={styles.step}>
                <div className={styles.stepNumber}>2</div>
                <h3>Join Group</h3>
                <p>
                  Register your commitment in the anonymous group. You're now a member,
                  but unidentifiable.
                </p>
              </div>

              <div className={styles.step}>
                <div className={styles.stepNumber}>3</div>
                <h3>Generate Proof</h3>
                <p>
                  Create a zero-knowledge proof that you're in the group without
                  revealing which member.
                </p>
              </div>

              <div className={styles.step}>
                <div className={styles.stepNumber}>4</div>
                <h3>Access Granted</h3>
                <p>
                  Server verifies your proof and grants access. Your identity
                  remains completely private.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Installation */}
        <section className={styles.installSection}>
          <div className="container">
            <div className={styles.installBox}>
              <div className={styles.installHeader}>
                <h2>Quick Install</h2>
                <span className={styles.versionBadge}>v1.0.0</span>
              </div>
              <InstallAnimation />
            </div>
          </div>
        </section>

        {/* 7. It's This Simple */}
        <section className={styles.simpleDemo}>
          <div className="container">
            <h2 className={styles.sectionTitle}>It's This Simple</h2>

            <div className={styles.demoSteps}>
              <div className={styles.demoStep}>
                <div className={styles.stepBadge}>1</div>
                <h3>Backend Setup</h3>
                <p style={{ marginBottom: '1rem', color: 'var(--ifm-color-content-secondary)' }}>
                  Protect your endpoint with one decorator
                </p>
                <CodeBlock language="typescript" className={styles.demoCodeBlock}>
{`// app.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { SemaphoreGuard } from 'zwt-access-lib';

@Controller()
export class AppController {
  @Get('protected')
  @UseGuards(SemaphoreGuard)
  getResource() {
    return { data: 'Secret data!' };
  }
}`}
                </CodeBlock>
              </div>

              <div className={styles.demoStep}>
                <div className={styles.stepBadge}>2</div>
                <h3>Frontend Setup</h3>
                <p style={{ marginBottom: '1rem', color: 'var(--ifm-color-content-secondary)' }}>
                  Create anonymous identity locally
                </p>
                <CodeBlock language="typescript" className={styles.demoCodeBlock}>
{`// client.ts
const identity = createIdentity();

// Stored locally only
// Never leaves the device`}
                </CodeBlock>
              </div>

              <div className={styles.demoStep}>
                <div className={styles.stepBadge}>3</div>
                <h3>Make Request</h3>
                <p style={{ marginBottom: '1rem', color: 'var(--ifm-color-content-secondary)' }}>
                  Zero-knowledge proof sent automatically
                </p>
                <CodeBlock language="typescript" className={styles.demoCodeBlock}>
{`// api-call.ts
const response = await fetch('/protected');
const data = await response.json();

// ✓ Anonymous & Secure`}
                </CodeBlock>
              </div>
            </div>
          </div>
        </section>

        {/* 8. Why ZWT? (NEW - consolidated Features + Security + Specs) */}
        <section className={styles.whyZWT}>
          <div className="container">
            <h2 className={styles.sectionTitle}>Why ZWT?</h2>
            <p className={styles.whySubtitle}>
              Battle-tested cryptography meets developer-friendly APIs
            </p>

            <div className={styles.whyGrid}>
              <div className={styles.whyBox}>
                <div className={styles.whyBoxHeader}>
                  <div className={styles.whyIcon}>🔐</div>
                  <h3>Cryptographically Secure</h3>
                </div>
                <p className={styles.whyDescription}>
                  Built on production-grade SNARKs using Semaphore Protocol v4.
                  Proofs are mathematically verified on BN254 curves with Poseidon hashing.
                </p>
                <div className={styles.whyMetrics}>
                  <div className={styles.whyMetric}>
                    <span className={styles.metricLabel}>Proof Generation</span>
                    <span className={styles.metricValue}>~2-3s</span>
                  </div>
                  <div className={styles.whyMetric}>
                    <span className={styles.metricLabel}>Verification</span>
                    <span className={styles.metricValue}>~100ms</span>
                  </div>
                </div>
              </div>

              <div className={styles.whyBox}>
                <div className={styles.whyBoxHeader}>
                  <div className={styles.whyIcon}>👤</div>
                  <h3>Complete Anonymity</h3>
                </div>
                <p className={styles.whyDescription}>
                  Server sees only valid proofs, never personal data. Users prove group
                  membership without revealing which member they are.
                </p>
                <div className={styles.whyMetrics}>
                  <div className={styles.whyMetric}>
                    <span className={styles.metricLabel}>Server Knowledge</span>
                    <span className={styles.metricValue}>Zero</span>
                  </div>
                  <div className={styles.whyMetric}>
                    <span className={styles.metricLabel}>User Tracking</span>
                    <span className={styles.metricValue}>Zero</span>
                  </div>
                </div>
              </div>

              <div className={styles.whyBox}>
                <div className={styles.whyBoxHeader}>
                  <div className={styles.whyIcon}>🛡️</div>
                  <h3>Replay Protection</h3>
                </div>
                <p className={styles.whyDescription}>
                  Built-in nullifier tracking prevents proof reuse. Each proof works once
                  per epoch with configurable time windows.
                </p>
                <div className={styles.whyMetrics}>
                  <div className={styles.whyMetric}>
                    <span className={styles.metricLabel}>Usage Limit</span>
                    <span className={styles.metricValue}>1 per epoch</span>
                  </div>
                  <div className={styles.whyMetric}>
                    <span className={styles.metricLabel}>Expiry</span>
                    <span className={styles.metricValue}>Automatic</span>
                  </div>
                </div>
              </div>

              <div className={styles.whyBox}>
                <div className={styles.whyBoxHeader}>
                  <div className={styles.whyIcon}>⚡</div>
                  <h3>Auto-Injection</h3>
                </div>
                <p className={styles.whyDescription}>
                  Frontend automatically generates and injects proofs. Developers just
                  make normal API calls with full TypeScript support.
                </p>
                <div className={styles.whyMetrics}>
                  <div className={styles.whyMetric}>
                    <span className={styles.metricLabel}>Backend</span>
                    <span className={styles.metricValue}>NestJS guards</span>
                  </div>
                  <div className={styles.whyMetric}>
                    <span className={styles.metricLabel}>Frontend</span>
                    <span className={styles.metricValue}>React hooks</span>
                  </div>
                </div>
              </div>

              <div className={styles.whyBox}>
                <div className={styles.whyBoxHeader}>
                  <div className={styles.whyIcon}>✅</div>
                  <h3>Production Ready</h3>
                </div>
                <p className={styles.whyDescription}>
                  Audited cryptography, comprehensive error handling, and full test coverage.
                  Compatible with modern Node.js and browsers.
                </p>
                <div className={styles.whyMetrics}>
                  <div className={styles.whyMetric}>
                    <span className={styles.metricLabel}>Node.js</span>
                    <span className={styles.metricValue}>≥20.0.0</span>
                  </div>
                  <div className={styles.whyMetric}>
                    <span className={styles.metricLabel}>Browsers</span>
                    <span className={styles.metricValue}>ES2020+</span>
                  </div>
                </div>
              </div>

              <div className={styles.whyBox}>
                <div className={styles.whyBoxHeader}>
                  <div className={styles.whyIcon}>📦</div>
                  <h3>Simple Integration</h3>
                </div>
                <p className={styles.whyDescription}>
                  Three packages, one install. Add a decorator to your controller,
                  create an identity in your frontend. Zero config needed.
                </p>
                <div className={styles.whyMetrics}>
                  <div className={styles.whyMetric}>
                    <span className={styles.metricLabel}>Proof Size</span>
                    <span className={styles.metricValue}>~1.5KB</span>
                  </div>
                  <div className={styles.whyMetric}>
                    <span className={styles.metricLabel}>Setup Time</span>
                    <span className={styles.metricValue}>&lt;5 min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 9. Powered by Semaphore (MOVED, simplified) */}
        <section className={styles.techStack}>
          <div className="container">
            <p className={styles.poweredBy}>Powered by</p>
            <h3 className={styles.semaphoreTitle}>Semaphore Protocol v4</h3>

            <div className={styles.techBadges}>
              <div className={styles.techBadge}>
                <span className={styles.techIcon}>⚡</span>
                TypeScript
              </div>
              <div className={styles.techBadge}>
                <span className={styles.techIcon}>🏗️</span>
                NestJS
              </div>
              <div className={styles.techBadge}>
                <span className={styles.techIcon}>⚛️</span>
                React
              </div>
              <div className={styles.techBadge}>
                <span className={styles.techIcon}>🔐</span>
                SNARKs
              </div>
              <div className={styles.techBadge}>
                <span className={styles.techIcon}>🌳</span>
                Merkle Trees
              </div>
              <div className={styles.techBadge}>
                <span className={styles.techIcon}>🔢</span>
                Poseidon Hash
              </div>
            </div>
          </div>
        </section>

        {/* 10. Complete Example */}
        <section className={styles.quickExample}>
          <div className="container">
            <h2 className={styles.sectionTitle}>Complete Example</h2>

            <div className={styles.exampleGrid}>
              <div className={styles.exampleCard}>
                <h3>Backend Setup</h3>
                <CodeBlock language="typescript" title="api.controller.ts">
{`// Protect any endpoint
@Controller('api')
export class ApiController {

  @Get('secret')
  @UseGuards(SemaphoreGuard)
  getSecret() {
    return {
      data: 'Only for members!'
    };
  }

  @Post('vote')
  @UseGuards(SemaphoreGuard)
  vote(@Body() dto: VoteDto) {
    // Nullifier prevents
    // double voting
    return this.votes.cast(dto);
  }
}`}
                </CodeBlock>
              </div>

              <div className={styles.exampleCard}>
                <h3>Frontend Usage</h3>
                <CodeBlock language="typescript" title="app.tsx">
{`// Create identity (once)
const identity = createIdentity();
localStorage.save(identity);

// Register in group
await api.post('/auth/signup');

// Access protected resource
// (proof auto-injected)
const secret = await api
  .get('/api/secret');

// Vote anonymously
await api.post('/api/vote', {
  choice: 'option_a'
});

// ✓ Identity stays private`}
                </CodeBlock>
              </div>
            </div>
          </div>
        </section>

        {/* 11. FAQ */}
        <section className={styles.faqSection}>
          <div className="container">
            <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>

            <div className={styles.faqGrid}>
              <details className={styles.faqItem}>
                <summary>How is this different from JWT?</summary>
                <p>
                  JWT requires a server to issue tokens and can track users. ZWT uses
                  zero-knowledge proofs where users prove group membership without
                  revealing identity. No user tracking possible.
                </p>
              </details>

              <details className={styles.faqItem}>
                <summary>Can users be de-anonymized?</summary>
                <p>
                  No. The cryptographic proof reveals zero information about which group
                  member created it. Even with full server access, identities cannot be
                  revealed.
                </p>
              </details>

              <details className={styles.faqItem}>
                <summary>What happens if I lose my identity?</summary>
                <p>
                  You can create a new identity and re-register. The old identity becomes
                  unusable but remains in the Merkle tree. Consider backing up your
                  private key.
                </p>
              </details>

              <details className={styles.faqItem}>
                <summary>Is this production-ready?</summary>
                <p>
                  Yes! Built on Semaphore Protocol v4, which is audited and used in
                  production. Includes TypeScript types, error handling, and comprehensive
                  tests.
                </p>
              </details>

              <details className={styles.faqItem}>
                <summary>What are epochs and why do I need them?</summary>
                <p>
                  Epochs enable time-based access control. Without epochs, a proof works
                  only once ever. With epochs, users can access resources once per time
                  period (hourly/daily/etc).
                </p>
              </details>

              <details className={styles.faqItem}>
                <summary>Can I use this with existing authentication?</summary>
                <p>
                  Yes! ZWT can complement traditional auth. Use it for anonymous actions
                  while keeping standard auth for identified actions.
                </p>
              </details>

              <details className={styles.faqItem}>
                <summary>How do I prevent Sybil attacks?</summary>
                <p>
                  Control group registration. Only allow verified entities to join (KYC,
                  token holding, invite-only, etc). ZWT proves membership, you control
                  who joins.
                </p>
              </details>

              <details className={styles.faqItem}>
                <summary>What's the browser/Node.js requirement?</summary>
                <p>
                  Node.js ≥20.0.0 for backend. Modern browsers (ES2020+) for frontend.
                  Uses WebAssembly for proof generation in browser.
                </p>
              </details>
            </div>
          </div>
        </section>

        {/* 12. Final CTA */}
        <section className={styles.finalCTA}>
          <div className="container">
            <div className={styles.ctaBox}>
              <h2>Ready to Add Anonymous Authentication?</h2>
              <p>
                Get started with ZWT in minutes. Full TypeScript support, NestJS guards,
                and React hooks included out of the box.
              </p>
              <div className={styles.ctaButtons}>
                <Link
                  className="button button--primary button--lg"
                  to="/docs/getting-started/installation">
                  Install ZWT
                </Link>
                <Link
                  className="button button--outline button--secondary button--lg"
                  to="/docs/api/overview">
                  API Docs
                </Link>
                <a
                  className="button button--outline button--secondary button--lg"
                  href="https://github.com/after9to5/zwt"
                  target="_blank"
                  rel="noopener noreferrer">
                  GitHub
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
