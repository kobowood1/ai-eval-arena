'use client';

import { useEffect, useState } from 'react';
import { Trash2, Plus, Loader2 } from 'lucide-react';
import { NeoButton } from '../../../components/ui/neo-button';
import { Panel } from '../../../components/ui/panel';
import { TerminalLabel } from '../../../components/ui/terminal-label';

interface ModelConfig {
  id: string;
  label: string;
  provider: string;
  model: string;
  createdAt: string;
}

const PROVIDERS = [
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'openai', label: 'OpenAI' },
];

const MODELS: Record<string, { value: string; label: string }[]> = {
  anthropic: [
    { value: 'claude-opus-4-7', label: 'Claude Opus 4.7' },
    { value: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6' },
    { value: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5' },
  ],
  openai: [
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gpt-4o-mini', label: 'GPT-4o mini' },
    { value: 'o3', label: 'o3' },
    { value: 'o4-mini', label: 'o4-mini' },
  ],
};

export default function SettingsPage() {
  const [configs, setConfigs] = useState<ModelConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const [label, setLabel] = useState('');
  const [provider, setProvider] = useState('anthropic');
  const [model, setModel] = useState('claude-opus-4-7');
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    fetch('/api/model-configs')
      .then(r => r.json())
      .then(data => { setConfigs(data as ModelConfig[]); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!label || !provider || !model || !apiKey) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/model-configs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label, provider, model, apiKey }),
      });
      if (!res.ok) throw new Error('Failed to save');
      const config = await res.json() as ModelConfig;
      setConfigs(prev => [...prev, config]);
      setLabel(''); setApiKey(''); setShowForm(false);
    } catch {
      setError('Failed to save model config. Check your API key and try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/model-configs/${id}`, { method: 'DELETE' });
    if (res.ok) setConfigs(prev => prev.filter(c => c.id !== id));
  }

  return (
    <div className="space-y-8">
      <div>
        <TerminalLabel color="pink">config://model_configs</TerminalLabel>
        <h1 className="mt-3 font-arcade text-2xl text-white">Model Configs</h1>
        <p className="mt-2 font-code text-sm text-white/50">
          Add API keys for the models you want to battle. Keys are encrypted at rest with AES-256-GCM.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 font-code text-sm text-white/40">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading...
        </div>
      ) : (
        <div className="space-y-3">
          {configs.length === 0 && !showForm && (
            <Panel color="cyan">
              <p className="font-code text-sm text-white/50 text-center py-4">
                No model configs yet. Add one to start dueling.
              </p>
            </Panel>
          )}

          {configs.map(cfg => (
            <Panel key={cfg.id} color="default">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-code text-sm font-bold text-white">{cfg.label}</span>
                  <span className="ml-3 font-code text-xs text-white/40">
                    {cfg.provider} / {cfg.model}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(cfg.id)}
                  className="text-white/30 hover:text-pink-400 transition p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Panel>
          ))}

          {showForm ? (
            <Panel color="pink">
              <form onSubmit={handleAdd} className="space-y-4">
                <TerminalLabel color="lime">new_config</TerminalLabel>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-code text-xs text-white/50 block mb-1">Label</label>
                    <input
                      value={label}
                      onChange={e => setLabel(e.target.value)}
                      placeholder="e.g. My Claude"
                      required
                      className="w-full bg-black border border-white/20 px-3 py-2 font-code text-sm text-white focus:border-pink-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-code text-xs text-white/50 block mb-1">Provider</label>
                    <select
                      value={provider}
                      onChange={e => { setProvider(e.target.value); setModel(MODELS[e.target.value]?.[0]?.value ?? ''); }}
                      className="w-full bg-black border border-white/20 px-3 py-2 font-code text-sm text-white focus:border-pink-500 focus:outline-none"
                    >
                      {PROVIDERS.map(p => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-code text-xs text-white/50 block mb-1">Model</label>
                    <select
                      value={model}
                      onChange={e => setModel(e.target.value)}
                      className="w-full bg-black border border-white/20 px-3 py-2 font-code text-sm text-white focus:border-pink-500 focus:outline-none"
                    >
                      {(MODELS[provider] ?? []).map(m => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-code text-xs text-white/50 block mb-1">API Key</label>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={e => setApiKey(e.target.value)}
                      placeholder="sk-ant-... or sk-..."
                      required
                      className="w-full bg-black border border-white/20 px-3 py-2 font-code text-sm text-white focus:border-pink-500 focus:outline-none"
                    />
                  </div>
                </div>

                {error && <p className="font-code text-xs text-pink-400">{error}</p>}

                <div className="flex gap-3">
                  <NeoButton type="submit" color="pink" size="sm" disabled={saving}
                    icon={saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}>
                    {saving ? 'Saving...' : 'Save Config'}
                  </NeoButton>
                  <NeoButton type="button" color="ghost" size="sm" onClick={() => setShowForm(false)}>
                    Cancel
                  </NeoButton>
                </div>
              </form>
            </Panel>
          ) : (
            <NeoButton
              color="cyan"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setShowForm(true)}
            >
              Add Model Config
            </NeoButton>
          )}
        </div>
      )}
    </div>
  );
}
