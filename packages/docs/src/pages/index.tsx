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
  const [copied, setCopied] = useState(false);

  const copyCommand = () => {
    navigator.clipboard.writeText('npm install zwt-access-lib');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
        <button
          className={styles.copyButton}
          onClick={copyCommand}
          title="Copy command"
        >
          {copied ? '✓ Copied!' : '📋 Copy'}
        </button>
      </div>
      <div className={styles.terminalContent}>
        {!showRunning && (
          <div className={styles.terminalLine}>
            <span className={styles.terminalPrompt}>$</span> {currentCommand}
            {isTyping && <span className={styles.cursor}>|</span>}
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
            <span className={styles.cursor}>|</span>
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

        {/* 3. Installation */}
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

        {/* 4. Authentication Without Surveillance */}
        <section className={styles.comparisonSection}>
          <div className="container">
            <h2 className={styles.sectionTitle}>Authentication Without Surveillance</h2>
            <p className={styles.sectionSubtitle}>
              Traditional auth systems force a choice between security and privacy. ZWT eliminates that trade-off.
            </p>

            <div className={styles.comparisonWrapper}>
              {/* Traditional Auth Card */}
              <div className={styles.comparisonCard}>
                <div className={styles.cardHeader}>
                  <h3>Traditional Auth</h3>
                  <span className={styles.cardBadge}>Current Standard</span>
                </div>

                <div className={styles.featureList}>
                  <div className={styles.featureItem}>
                    <span className={styles.featureIcon}>📊</span>
                    <div className={styles.featureContent}>
                      <strong>User Data Storage</strong>
                      <p>Emails, passwords, IPs, session tokens tracked forever</p>
                    </div>
                  </div>

                  <div className={styles.featureItem}>
                    <span className={styles.featureIcon}>🎯</span>
                    <div className={styles.featureContent}>
                      <strong>Request Tracking</strong>
                      <p>Every action logged and linked to user identity</p>
                    </div>
                  </div>

                  <div className={styles.featureItem}>
                    <span className={styles.featureIcon}>⚖️</span>
                    <div className={styles.featureContent}>
                      <strong>Compliance Burden</strong>
                      <p>GDPR, CCPA, HIPAA requirements for data handling</p>
                    </div>
                  </div>

                  <div className={styles.featureItem}>
                    <span className={styles.featureIcon}>🎯</span>
                    <div className={styles.featureContent}>
                      <strong>Security Risk</strong>
                      <p>High-value target for attackers and data breaches</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Zero-Knowledge Auth Card */}
              <div className={styles.comparisonCard} data-highlight="true">
                <div className={styles.cardHeader}>
                  <h3>Zero-Knowledge Auth</h3>
                  <span className={styles.cardBadge} data-type="primary">With ZWT</span>
                </div>

                <div className={styles.featureList}>
                  <div className={styles.featureItem}>
                    <span className={styles.featureIcon}>🔐</span>
                    <div className={styles.featureContent}>
                      <strong>Zero PII Storage</strong>
                      <p>Only cryptographic commitments, no personal data</p>
                    </div>
                  </div>

                  <div className={styles.featureItem}>
                    <span className={styles.featureIcon}>👻</span>
                    <div className={styles.featureContent}>
                      <strong>Anonymous by Design</strong>
                      <p>Tracking is cryptographically impossible</p>
                    </div>
                  </div>

                  <div className={styles.featureItem}>
                    <span className={styles.featureIcon}>✅</span>
                    <div className={styles.featureContent}>
                      <strong>Privacy by Default</strong>
                      <p>Automatic compliance with privacy regulations</p>
                    </div>
                  </div>

                  <div className={styles.featureItem}>
                    <span className={styles.featureIcon}>🛡️</span>
                    <div className={styles.featureContent}>
                      <strong>Nothing to Breach</strong>
                      <p>No sensitive data means no data breach liability</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.ctoQuote}>
              <div className={styles.quoteIcon}>"</div>
              <blockquote className={styles.quoteText}>
                Reduce your attack surface, eliminate PII storage liability, and build user trust through cryptographic guarantees—not policies.
              </blockquote>
              <div className={styles.quoteAttribution}>For CTOs & Security Leaders</div>
            </div>
          </div>
        </section>

        {/* 5. Use Cases (MOVED) */}
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

        {/* 6. How It Works (MOVED) */}
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

        {/* 7. It's This Simple */}
        <section className={styles.simpleDemo}>
          <div className="container">
            <h2 className={styles.sectionTitle}>Three Lines of Code</h2>
            <p className={styles.sectionSubtitle}>
              That's all it takes to add anonymous authentication to your application.
            </p>

            <div className={styles.threeLineShowcase}>
              <div className={styles.codeLineItem}>
                <div className={styles.lineNumber}>1</div>
                <div className={styles.lineContent}>
                  <CodeBlock language="typescript" className={styles.inlineCodeBlock}>
{`const identity = createIdentity();`}
                  </CodeBlock>
                  <p className={styles.lineDescription}>Create anonymous identity</p>
                </div>
              </div>

              <div className={styles.codeLineItem}>
                <div className={styles.lineNumber}>2</div>
                <div className={styles.lineContent}>
                  <CodeBlock language="typescript" className={styles.inlineCodeBlock}>
{`await register(identity.commitment);`}
                  </CodeBlock>
                  <p className={styles.lineDescription}>Register in group</p>
                </div>
              </div>

              <div className={styles.codeLineItem}>
                <div className={styles.lineNumber}>3</div>
                <div className={styles.lineContent}>
                  <CodeBlock language="typescript" className={styles.inlineCodeBlock}>
{`const data = await fetch('/api/protected');`}
                  </CodeBlock>
                  <p className={styles.lineDescription}>Access protected resources</p>
                </div>
              </div>
            </div>

            <div className={styles.demoSteps}>
              <div className={styles.demoStep}>
                <div className={styles.demoStepHeader}>
                  <div className={styles.stepBadge}>1</div>
                  <div className={styles.demoStepInfo}>
                    <h3>Backend Setup</h3>
                    <p>Protect your endpoint with one decorator</p>
                  </div>
                </div>
                <CodeBlock language="typescript" className={styles.demoCodeBlock}>
{`@Controller('api')
export class AppController {
  @Get('protected')
  @UseGuards(SemaphoreGuard)
  getResource() {
    return { data: 'Secret!' };
  }
}`}
                </CodeBlock>
              </div>

              <div className={styles.demoStep}>
                <div className={styles.demoStepHeader}>
                  <div className={styles.stepBadge}>2</div>
                  <div className={styles.demoStepInfo}>
                    <h3>Frontend Setup</h3>
                    <p>Create and store identity securely</p>
                  </div>
                </div>
                <CodeBlock language="typescript" className={styles.demoCodeBlock}>
{`const identity = createIdentity();

localStorage.setItem('identity',
  JSON.stringify(identity)
);

await fetch('/auth/register', {
  body: JSON.stringify({
    commitment: identity.commitment
  })
});`}
                </CodeBlock>
              </div>

              <div className={styles.demoStep}>
                <div className={styles.demoStepHeader}>
                  <div className={styles.stepBadge}>3</div>
                  <div className={styles.demoStepInfo}>
                    <h3>Make Authenticated Request</h3>
                    <p>Zero-knowledge proof is generated and sent automatically</p>
                  </div>
                </div>
                <CodeBlock language="typescript" className={styles.demoCodeBlock}>
{`const response = await fetch(
  '/api/protected'
);

const data = await response.json();

console.log(data);
// { data: 'Secret!' }

// ✓ Authenticated & Anonymous`}
                </CodeBlock>
              </div>
            </div>
          </div>
        </section>

        {/* 8. Powered by Semaphore (MOVED, simplified) */}
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

        {/* 9. Complete Example */}
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

        {/* 10. FAQ */}
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

        {/* 11. Final CTA */}
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
                  href="https://github.com/francoperez03/zwt"
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
