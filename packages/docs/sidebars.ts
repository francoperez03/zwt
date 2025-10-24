import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  // Main documentation sidebar
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started/installation',
        'getting-started/quick-start',
        'getting-started/architecture',
      ],
    },
    {
      type: 'category',
      label: 'Core Concepts',
      items: [
        'concepts/identity',
        'concepts/zero-knowledge-proofs',
        'concepts/semaphore-protocol',
        'concepts/access-control',
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      items: [
        'guides/creating-identity',
        'guides/accessing-protected-resources',
        'guides/backend-integration',
      ],
    },
  ],

  // API Reference sidebar
  apiSidebar: [
    'api/overview',
    {
      type: 'category',
      label: 'Shared Library (zwt-access-lib)',
      items: [
        'api/lib/identity',
        'api/lib/proof',
        'api/lib/context',
        'api/lib/types',
      ],
    },
    {
      type: 'category',
      label: 'Backend API',
      items: [
        'api/backend/auth',
        'api/backend/protected',
        'api/backend/semaphore',
      ],
    },
    {
      type: 'category',
      label: 'Frontend Components',
      items: [
        'api/frontend/hooks',
        'api/frontend/components',
        'api/frontend/api-client',
      ],
    },
  ],
};

export default sidebars;
