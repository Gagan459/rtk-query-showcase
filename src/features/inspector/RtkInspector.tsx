import React, { useState } from 'react';
import { useAppSelector } from '../../app/hooks';
import { mockDb } from '../api/mockDb';
import { apiSlice } from '../api/apiSlice';
import { useAppDispatch } from '../../app/hooks';
import {
  Database,
  Sliders,
  AlertCircle,
  RotateCcw,
  Layers,
  ChevronDown,
  ChevronUp,
  Activity,
  Check,
} from 'lucide-react';

export const RtkInspector: React.FC = () => {
  const dispatch = useAppDispatch();
  const apiState = useAppSelector((state) => state.api);
  const [latency, setLatency] = useState<number>(mockDb.simulatedLatencyMs);
  const [simulateError, setSimulateError] = useState<boolean>(mockDb.simulateError);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [showRawState, setShowRawState] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const queries = apiState.queries || {};
  const mutations = apiState.mutations || {};

  const queryKeys = Object.keys(queries);
  const mutationKeys = Object.keys(mutations);

  const handleLatencyChange = (ms: number) => {
    mockDb.simulatedLatencyMs = ms;
    setLatency(ms);
  };

  const handleToggleError = (enabled: boolean) => {
    mockDb.simulateError = enabled;
    setSimulateError(enabled);
  };

  const handleResetDb = () => {
    mockDb.resetDatabase();
    // Invalidate everything to trigger fresh fetch
    dispatch(apiSlice.util.invalidateTags([{ type: 'Post', id: 'LIST' }]));
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <aside className="rtk-inspector-card">
      <div className="inspector-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="inspector-title-wrap">
          <Database size={18} className="text-purple" />
          <div>
            <h3>RTK Query State Inspector</h3>
            <span className="inspector-subtitle">Live Redux Cache & Network Simulator</span>
          </div>
        </div>
        <button className="btn-icon" aria-label="Toggle inspector">
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {isExpanded && (
        <div className="inspector-body">
          {/* Simulation controls */}
          <div className="inspector-section">
            <div className="section-label">
              <Sliders size={14} />
              <span>Simulated Network Latency</span>
            </div>
            <div className="latency-btn-group">
              <button
                className={`btn-latency ${latency === 0 ? 'active' : ''}`}
                onClick={() => handleLatencyChange(0)}
              >
                0ms (Instant)
              </button>
              <button
                className={`btn-latency ${latency === 400 ? 'active' : ''}`}
                onClick={() => handleLatencyChange(400)}
              >
                400ms (Default)
              </button>
              <button
                className={`btn-latency ${latency === 1200 ? 'active' : ''}`}
                onClick={() => handleLatencyChange(1200)}
              >
                1.2s (Slow 3G)
              </button>
            </div>
          </div>

          <div className="inspector-section">
            <div className="section-label">
              <AlertCircle size={14} />
              <span>Network Failure Test</span>
            </div>
            <label className="toggle-switch-label">
              <input
                type="checkbox"
                checked={simulateError}
                onChange={(e) => handleToggleError(e.target.checked)}
              />
              <span className="toggle-slider"></span>
              <span className="toggle-text">
                {simulateError ? '500 Server Error Emulation (ON)' : 'Normal Connectivity (OFF)'}
              </span>
            </label>
            {simulateError && (
              <p className="helper-note danger-text">
                Mutations and queries will now throw errors to demonstrate RTK Query error handling & rollback!
              </p>
            )}
          </div>

          {/* Cache stats */}
          <div className="inspector-section">
            <div className="section-label">
              <Activity size={14} />
              <span>Live Cache Subscriptions</span>
            </div>

            <div className="stats-row">
              <div className="stat-box">
                <span className="stat-number">{queryKeys.length}</span>
                <span className="stat-desc">Cached Queries</span>
              </div>
              <div className="stat-box">
                <span className="stat-number">{mutationKeys.length}</span>
                <span className="stat-desc">Mutations Fired</span>
              </div>
              <div className="stat-box">
                <span className="stat-number">60s</span>
                <span className="stat-desc">keepUnusedDataFor</span>
              </div>
            </div>

            {/* Queries list */}
            <div className="query-cache-list">
              <span className="cache-list-title">Active Query Subscriptions:</span>
              {queryKeys.length === 0 ? (
                <div className="cache-empty">No active query subscriptions.</div>
              ) : (
                queryKeys.map((key) => {
                  const q = queries[key];
                  const status = q?.status || 'uninitialized';
                  return (
                    <div key={key} className="cache-item">
                      <div className="cache-item-header">
                        <span className={`cache-status-badge status-${status}`}>
                          {status}
                        </span>
                        <button
                          className="btn-copy-sm"
                          onClick={() => handleCopyKey(key)}
                          title="Copy query cache key"
                        >
                          {copiedKey === key ? <Check size={12} /> : 'copy'}
                        </button>
                      </div>
                      <div className="cache-item-key" title={key}>
                        {key}
                      </div>
                      <div className="cache-item-meta">
                        <span>Items cached: {Array.isArray(q?.data) ? q.data.length : (q?.data ? 1 : 0)}</span>
                        <span>•</span>
                        <span>fulfilled: {q?.fulfilledTimeStamp ? new Date(q.fulfilledTimeStamp).toLocaleTimeString() : 'N/A'}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="inspector-actions">
            <button
              className="btn btn-secondary btn-block"
              onClick={() => setShowRawState(!showRawState)}
            >
              <Layers size={14} />
              <span>{showRawState ? 'Hide Redux Raw State' : 'View Redux Store JSON'}</span>
            </button>

            <button
              className="btn btn-secondary btn-block"
              onClick={handleResetDb}
            >
              <RotateCcw size={14} />
              <span>Reset Mock Database</span>
            </button>
          </div>

          {showRawState && (
            <div className="raw-state-viewer">
              <pre>{JSON.stringify(apiState, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </aside>
  );
};
