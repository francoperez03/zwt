import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Zero-Knowledge Token - Anonymous Access Control with Semaphore Protocol"
      wrapperClassName="homepage-wrapper">
      <main className="homepage-iframe-container">
        {/* ZWT Application Embedded */}
        <div style={{
          width: '100%',
          minHeight: 'calc(100vh - 60px)', /* Full viewport minus navbar */
          background: 'hsl(220, 20%, 6%)', /* Match frontend dark background */
        }}>
          <iframe
            src="http://localhost:5173"
            className="zwt-app-iframe"
            style={{
              width: '100%',
              height: 'calc(100vh - 60px)',
              minHeight: '800px',
              border: 'none',
              display: 'block'
            }}
            title="ZWT Application"
          />
        </div>

        {/* Info Section */}
        <section style={{
          padding: '3rem 0 2rem',
          backgroundColor: 'var(--ifm-background-surface-color)',
          borderTop: '1px solid var(--ifm-color-emphasis-300)'
        }}>
          <div className="container">
            <div className="text--center">
              <p style={{
                color: 'var(--ifm-color-content-secondary)',
                marginBottom: '1.5rem'
              }}>
                <strong>Note:</strong> Make sure the frontend is running on <code>http://localhost:5173</code>
              </p>
              <div style={{display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap'}}>
                <Link
                  className="button button--primary button--lg"
                  to="/docs/intro">
                  📚 Read Documentation
                </Link>
                <Link
                  className="button button--secondary button--lg"
                  to="/docs/getting-started/quick-start">
                  🚀 Quick Start Guide
                </Link>
                <Link
                  className="button button--outline button--secondary button--lg"
                  to="/docs/api/overview">
                  📖 API Reference
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
