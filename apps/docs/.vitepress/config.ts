import { defineConfig } from 'vitepress';
import typedocSidebar from '../api/typedoc-sidebar.json' with { type: 'json' };

export default defineConfig({
  title: 'Dependabit',
  description: 'AI-Powered Dependency Tracking for External Resources',
  base: '/dependabit/',
  lastUpdated: true,
  cleanUrls: true,
  ignoreDeadLinks: true,
  head: [
    ['meta', { property: 'og:title', content: 'Dependabit' }],
    [
      'meta',
      {
        property: 'og:description',
        content: 'AI-Powered Dependency Tracking for External Resources'
      }
    ],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:url', content: 'https://pradeepmouli.github.io/dependabit/' }],
    ['meta', { name: 'twitter:card', content: 'summary' }],
    ['meta', { name: 'twitter:title', content: 'Dependabit' }],
    [
      'meta',
      {
        name: 'twitter:description',
        content: 'AI-Powered Dependency Tracking for External Resources'
      }
    ]
  ],
  sitemap: {
    hostname: 'https://pradeepmouli.github.io/dependabit'
  },
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/' },
      { text: 'GitHub', link: 'https://github.com/pradeepmouli/dependabit' }
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/guide/getting-started' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Usage', link: '/guide/usage' }
          ]
        },
        {
          text: 'Guides',
          items: [
            { text: 'Architecture', link: '/guide/architecture' },
            { text: 'Setup', link: '/guide/setup' },
            { text: 'Auto-Update', link: '/guide/auto-update' },
            { text: 'Examples', link: '/guide/examples' },
            { text: 'Development', link: '/guide/development' },
            { text: 'Testing', link: '/guide/testing' },
            { text: 'Workspace', link: '/guide/workspace' },
            { text: 'LLM Integration', link: '/guide/llm-integration' },
            { text: 'Troubleshooting', link: '/guide/troubleshooting' }
          ]
        }
      ],
      '/reference/': [
        {
          text: 'Decision Records',
          items: [{ text: 'Overview', link: '/reference/decisions/' }]
        }
      ],
      '/api/': [{ text: 'Packages', items: typedocSidebar }]
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/pradeepmouli/dependabit' }],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 Pradeep Mouli'
    },
    search: { provider: 'local' }
  }
});
