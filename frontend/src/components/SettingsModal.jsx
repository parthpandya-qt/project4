import React, { useState, useEffect } from "react";
import { X, Database, Check, Copy, AlertCircle, RefreshCw, Key, ShieldCheck, ExternalLink, Link2 } from "lucide-react";
import { fetchConfigStatus, updateConfig } from "../services/api";

export default function SettingsModal({ isOpen, onClose, onConfigUpdated }) {
  const [config, setConfig] = useState(null);
  const [supabaseUrl, setSupabaseUrl] = useState("https://pdmxopkxaqelwrrbyslu.supabase.co");
  const [supabaseKey, setSupabaseKey] = useState("");
  const [databaseUrl, setDatabaseUrl] = useState("postgresql://postgres:Parth%407566111175@db.pdmxopkxaqelwrrbyslu.supabase.co:5432/postgres");
  const [geminiKey, setGeminiKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const projectRef = "pdmxopkxaqelwrrbyslu";

  useEffect(() => {
    if (isOpen) {
      loadConfig();
    }
  }, [isOpen]);

  async function loadConfig() {
    try {
      const data = await fetchConfigStatus();
      setConfig(data);
      if (data.supabase_url) setSupabaseUrl(data.supabase_url);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSaveSuccess(false);

    try {
      const res = await updateConfig({
        supabase_url: supabaseUrl,
        supabase_key: supabaseKey,
        database_url: databaseUrl,
        gemini_key: geminiKey,
        openai_key: openaiKey,
      });
      setSaveSuccess(true);
      await loadConfig();
      if (onConfigUpdated) onConfigUpdated(res.storage);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setErrorMsg("Failed to update configuration: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleCopySql() {
    if (config?.sql_schema) {
      navigator.clipboard.writeText(config.sql_schema);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2500);
    }
  }

  if (!isOpen) return null;

  const isConnected = config?.storage?.connected;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "720px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "18px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{
                width: "34px",
                height: "34px",
                borderRadius: "10px",
                background: "rgba(6, 182, 212, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <Database size={18} color="var(--accent-cyan)" />
              </div>
              <h2 style={{ fontSize: "1.35rem" }}>Supabase Cloud Connection</h2>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "4px" }}>
              Project: <code style={{ color: "var(--accent-cyan)" }}>{projectRef}</code> &bull; Connect directly to your cloud PostgreSQL database.
            </p>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: "6px" }}>
            <X size={20} />
          </button>
        </div>

        {/* Current Connection Status Alert */}
        <div style={{
          padding: "14px 16px",
          borderRadius: "var(--radius-md)",
          background: isConnected ? "rgba(16, 185, 129, 0.1)" : "rgba(6, 182, 212, 0.1)",
          border: `1px solid ${isConnected ? "rgba(16, 185, 129, 0.25)" : "rgba(6, 182, 212, 0.25)"}`,
          marginBottom: "20px",
          display: "flex",
          alignItems: "flex-start",
          gap: "12px",
        }}>
          {isConnected ? (
            <ShieldCheck size={20} color="#10b981" style={{ marginTop: "2px", flexShrink: 0 }} />
          ) : (
            <AlertCircle size={20} color="#06b6d4" style={{ marginTop: "2px", flexShrink: 0 }} />
          )}
          <div style={{ flexGrow: 1 }}>
            <div style={{ fontWeight: "700", fontSize: "0.9rem", color: isConnected ? "#34d399" : "#22d3ee" }}>
              {isConnected ? "Supabase Live Connected" : "Project Registered & Ready"}
            </div>
            <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: "2px" }}>
              {config?.storage?.message || `Your Supabase project (${supabaseUrl}) is connected. Enter your public anon key below to enable automatic real-time sync!`}
            </div>
          </div>

          <a 
            href={`https://supabase.com/dashboard/project/${projectRef}/settings/api`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
            style={{ fontSize: "0.75rem", padding: "4px 8px", display: "inline-flex", alignItems: "center", gap: "4px" }}
          >
            <span>Get Anon Key</span>
            <ExternalLink size={12} />
          </a>
        </div>

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label" style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Supabase Project URL</span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>HTTPS API Endpoint</span>
            </label>
            <input
              type="url"
              className="form-input"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Supabase Anon / Service Role Key</span>
              <a 
                href={`https://supabase.com/dashboard/project/${projectRef}/settings/api`}
                target="_blank" 
                rel="noreferrer"
                style={{ fontSize: "0.75rem", color: "var(--accent-cyan)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "3px" }}
              >
                <span>Find in Supabase Dashboard</span>
                <ExternalLink size={11} />
              </a>
            </label>
            <input
              type="password"
              className="form-input"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: "flex", justifyContent: "space-between" }}>
              <span>PostgreSQL Connection String (URI)</span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Port 5432 / 6543</span>
            </label>
            <input
              type="text"
              className="form-input"
              style={{ fontSize: "0.82rem", fontFamily: "monospace" }}
              value={databaseUrl}
              onChange={(e) => setDatabaseUrl(e.target.value)}
            />
          </div>

          {/* AI Engine Status Banner */}
          <div style={{
            background: "rgba(16, 185, 129, 0.08)",
            border: "1px solid rgba(16, 185, 129, 0.25)",
            borderRadius: "var(--radius-md)",
            padding: "12px 14px",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#10b981",
                boxShadow: "0 0 8px #10b981"
              }} />
              <div>
                <div style={{ fontSize: "0.82rem", fontWeight: "700", color: "#34d399" }}>
                  Google Gemini AI: Connected (gemini-2.5-flash)
                </div>
                <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
                  Primary generative engine active. No OpenAI key is needed!
                </div>
              </div>
            </div>
            <span className="badge badge-emerald" style={{ fontSize: "0.68rem" }}>Active</span>
          </div>


          {errorMsg && (
            <div style={{ color: "var(--accent-rose)", fontSize: "0.85rem", marginBottom: "14px" }}>
              {errorMsg}
            </div>
          )}

          {saveSuccess && (
            <div style={{ color: "var(--accent-emerald)", fontSize: "0.85rem", marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Check size={16} /> Configuration updated successfully!
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px" }}>
            <button
              type="button"
              onClick={handleCopySql}
              className="btn btn-secondary btn-sm"
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
              title="Copy the SQL table definition to paste in Supabase"
            >
              {copiedSql ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              <span>{copiedSql ? "SQL Schema Copied!" : "Copy Supabase SQL Schema"}</span>
            </button>

            <div style={{ display: "flex", gap: "10px" }}>
              <button type="button" onClick={onClose} className="btn btn-ghost btn-sm">
                Close
              </button>
              <button type="submit" disabled={loading} className="btn btn-primary btn-sm">
                {loading ? <RefreshCw size={14} className="spin" /> : <Check size={14} />}
                <span>Save Credentials</span>
              </button>
            </div>
          </div>
        </form>

        {/* Quick Guide to Run SQL in Supabase */}
        <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--border-subtle)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--text-secondary)" }}>
              STEP-BY-STEP SUPABASE INITIALIZATION:
            </span>
            <a 
              href={`https://supabase.com/dashboard/project/${projectRef}/sql/new`}
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: "0.75rem", color: "var(--accent-purple)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "3px" }}
            >
              <span>Open Supabase SQL Editor</span>
              <ExternalLink size={11} />
            </a>
          </div>

          <ol style={{ fontSize: "0.8rem", color: "var(--text-secondary)", paddingLeft: "18px", lineHeight: 1.6 }}>
            <li>Click <strong>"Copy Supabase SQL Schema"</strong> above.</li>
            <li>Click <strong>"Open Supabase SQL Editor"</strong> and paste the SQL script into a new query.</li>
            <li>Click <strong>Run</strong> in Supabase to create the <code style={{ color: "var(--accent-cyan)" }}>trips</code> table.</li>
            <li>Copy your public <strong>anon key</strong> from <a href={`https://supabase.com/dashboard/project/${projectRef}/settings/api`} target="_blank" rel="noreferrer" style={{ color: "var(--accent-cyan)" }}>API Settings</a> into the input field above and click <strong>Save</strong>.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
