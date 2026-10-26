import { useState } from 'react';
import { PostsList } from './features/posts/PostsList';
import { RtkInspector } from './features/inspector/RtkInspector';
import { CodeViewer } from './features/code-viewer/CodeViewer';
import {
  Zap,
  BookOpen,
  LayoutGrid,
  RefreshCw,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export function App() {
  const [activeView, setActiveView] = useState<'app' | 'guide'>('app');

  return (
    <div className="app-shell">
      {/* Navigation & Header */}
      <header className="app-header">
        <div className="header-inner">
          <div className="brand-group">
            <div className="brand-logo">
              <Zap size={22} className="brand-icon" />
            </div>
            <div>
              <div className="brand-title-wrap">
                <h1 className="brand-title">RTK Query in React</h1>
                <span className="badge-rtk">Redux Toolkit 2.x</span>
              </div>
              <p className="brand-subtitle">
                Automated caching, declarative invalidation & optimistic updates
              </p>
            </div>
          </div>

          <div className="header-actions">
            <nav className="nav-tabs">
              <button
                className={`nav-tab ${activeView === 'app' ? 'active' : ''}`}
                onClick={() => setActiveView('app')}
              >
                <LayoutGrid size={16} />
                <span>Interactive App</span>
              </button>
              <button
                className={`nav-tab ${activeView === 'guide' ? 'active' : ''}`}
                onClick={() => setActiveView('guide')}
              >
                <BookOpen size={16} />
                <span>Configuration Guide</span>
              </button>
            </nav>

            <a
              href="https://redux-toolkit.js.org/rtk-query/overview"
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary btn-docs"
            >
              <span>RTK Docs</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {activeView === 'app' ? (
          <div className="app-layout">
            <div className="main-feed">
              <div className="feed-intro-banner">
                <div className="banner-icon">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h4>Interactive RTK Query Testing Environment</h4>
                  <p>
                    Perform CRUD mutations, filter queries, toggle polling, and inspect how
                    RTK Query manages deduplication and cache invalidation in real time.
                  </p>
                </div>
              </div>

              <PostsList />
            </div>

            <aside className="sidebar-col">
              <RtkInspector />

              <div className="feature-highlight-card">
                <div className="card-header-compact">
                  <Cpu size={16} className="text-cyan" />
                  <h4>How RTK Query Works</h4>
                </div>
                <ul className="concept-list">
                  <li>
                    <strong>createApi():</strong> Defines endpoints, data types, and base URL.
                  </li>
                  <li>
                    <strong>Automatic Hooks:</strong> RTK Query generates{' '}
                    <code>useGetPostsQuery</code>, <code>useAddPostMutation</code>, etc.
                  </li>
                  <li>
                    <strong>Declarative Invalidation:</strong> <code>providesTags</code> and{' '}
                    <code>invalidatesTags</code> handle re-fetching automatically.
                  </li>
                  <li>
                    <strong>Optimistic Updates:</strong> Update local cache instantly via{' '}
                    <code>onQueryStarted</code>.
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        ) : (
          <div className="guide-layout">
            <div className="guide-header-card">
              <div className="guide-badge">
                <ShieldCheck size={16} />
                <span>Step-by-Step Architecture</span>
              </div>
              <h2>How to Configure RTK Query in any React Application</h2>
              <p>
                RTK Query is built directly into <code>@reduxjs/toolkit</code>. It replaces hundreds of
                lines of custom <code>useEffect</code> fetching, loading flags, cache maps, and manual
                error state management.
              </p>
            </div>

            {/* Code snippets and configuration walkthrough */}
            <CodeViewer />

            {/* Core Concepts Breakdown Grid */}
            <div className="concepts-grid">
              <div className="concept-card">
                <div className="concept-icon-wrap icon-cyan">
                  <Layers size={20} />
                </div>
                <h3>1. Zero Boilerplate Caching</h3>
                <p>
                  RTK Query automatically deduplicates identical queries and caches results based on
                  endpoint names and serialized arguments. Components subscribing to the same query
                  share identical cache data.
                </p>
              </div>

              <div className="concept-card">
                <div className="concept-icon-wrap icon-emerald">
                  <RefreshCw size={20} />
                </div>
                <h3>2. Declarative Tag Invalidation</h3>
                <p>
                  Tagging queries with <code>providesTags</code> (e.g. <code>['Post']</code>) and
                  mutations with <code>invalidatesTags</code> creates automated reactive dependencies.
                  When you mutate data, relevant queries re-render automatically.
                </p>
              </div>

              <div className="concept-card">
                <div className="concept-icon-wrap icon-purple">
                  <Zap size={20} />
                </div>
                <h3>3. Instant Optimistic UI</h3>
                <p>
                  With <code>onQueryStarted</code>, you can patch cached query drafts before the network
                  request resolves. If the request fails, the patch is cleanly rolled back with no
                  visual glitches.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-inner">
          <p>© 2026 RTK Query React Architecture Showcase • Powered by Vite, React 19 & Redux Toolkit</p>
          <div className="footer-links">
            <span>Project Path: <code>C:\Users\gagan\.gemini\antigravity-ide\scratch\rtk-query-showcase</code></span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
