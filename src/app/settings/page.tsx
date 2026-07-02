'use client';
import { useEffect, useState } from 'react';
import { getSettings, updateSettings } from '@/services/api';
import Toast from '@/components/Toast';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    storeName: 'Blinkit Clone',
    deliveryTime: '10 mins',
    minOrderAmount: 0,
    deliveryFeeEnabled: false,
    deliveryFee: 0,
    gstEnabled: false,
    gstPercentage: 0,
    handlingFeeEnabled: false,
    handlingFee: 0,
    freeDeliveryThresholdEnabled: false,
    freeDeliveryThreshold: 0,
    contactNumber: '9239321112',
    defaultLanguage: 'en',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    getSettings()
      .then((res) => {
        setSettings({
          storeName: res.data.storeName || 'Blinkit Clone',
          deliveryTime: res.data.deliveryTime || '10 mins',
          minOrderAmount: res.data.minOrderAmount || 0,
          deliveryFeeEnabled: res.data.deliveryFeeEnabled || false,
          deliveryFee: res.data.deliveryFee || 0,
          gstEnabled: res.data.gstEnabled || false,
          gstPercentage: res.data.gstPercentage || 0,
          handlingFeeEnabled: res.data.handlingFeeEnabled || false,
          handlingFee: res.data.handlingFee || 0,
          freeDeliveryThresholdEnabled: res.data.freeDeliveryThresholdEnabled || false,
          freeDeliveryThreshold: res.data.freeDeliveryThreshold || 0,
          contactNumber: res.data.contactNumber || '9239321112',
          defaultLanguage: res.data.defaultLanguage || 'en',
        });
      })
      .catch((err) => {
        console.error(err);
        setToast({ message: 'Failed to load settings', type: 'error' });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings(settings);
      setToast({ message: '✅ Settings updated successfully!', type: 'success' });
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to update settings', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">⚙️ App Settings</div>
      </div>

      <div className="page-content">
        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : (
          <form onSubmit={handleSave} style={{ maxWidth: 650 }}>
            <div className="card" style={{ marginBottom: 24 }}>
              <div className="card-header">
                <div className="card-title">🏪 Store Information</div>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Store Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={settings.storeName}
                    onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Delivery Time (Displayed on App)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 10 mins"
                    value={settings.deliveryTime}
                    onChange={(e) => setSettings({ ...settings, deliveryTime: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Minimum Order Amount (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    min="0"
                    value={settings.minOrderAmount}
                    onChange={(e) => setSettings({ ...settings, minOrderAmount: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="card" style={{ marginBottom: 24 }}>
              <div className="card-header">
                <div className="card-title">🚚 Delivery Fee Settings</div>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Enable Delivery Fee</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>If enabled, a delivery charge will be added to checkout total.</div>
                  </div>
                  <label className="switch-container" style={{ position: 'relative', display: 'inline-block', width: 48, height: 24 }}>
                    <input
                      type="checkbox"
                      checked={settings.deliveryFeeEnabled}
                      onChange={(e) => setSettings({ ...settings, deliveryFeeEnabled: e.target.checked })}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span className={`switch-slider ${settings.deliveryFeeEnabled ? 'active' : ''}`} />
                  </label>
                </div>

                {settings.deliveryFeeEnabled && (
                  <>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Delivery Fee Amount (₹)</label>
                      <input
                        type="number"
                        className="form-input"
                        min="0"
                        value={settings.deliveryFee}
                        onChange={(e) => setSettings({ ...settings, deliveryFee: Number(e.target.value) })}
                        required
                      />
                    </div>

                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 8 }} />

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Enable Free Delivery Threshold</div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>If enabled, delivery will be free when order total meets/exceeds threshold.</div>
                      </div>
                      <label className="switch-container" style={{ position: 'relative', display: 'inline-block', width: 48, height: 24 }}>
                        <input
                          type="checkbox"
                          checked={settings.freeDeliveryThresholdEnabled}
                          onChange={(e) => setSettings({ ...settings, freeDeliveryThresholdEnabled: e.target.checked })}
                          style={{ opacity: 0, width: 0, height: 0 }}
                        />
                        <span className={`switch-slider ${settings.freeDeliveryThresholdEnabled ? 'active' : ''}`} />
                      </label>
                    </div>

                    {settings.freeDeliveryThresholdEnabled && (
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Free Delivery Threshold Amount (₹)</label>
                        <input
                          type="number"
                          className="form-input"
                          min="0"
                          value={settings.freeDeliveryThreshold}
                          onChange={(e) => setSettings({ ...settings, freeDeliveryThreshold: Number(e.target.value) })}
                          required
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="card" style={{ marginBottom: 24 }}>
              <div className="card-header">
                <div className="card-title">📊 GST (Tax) Settings</div>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Enable GST</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>If enabled, GST will be calculated as a percentage of the subtotal.</div>
                  </div>
                  <label className="switch-container" style={{ position: 'relative', display: 'inline-block', width: 48, height: 24 }}>
                    <input
                      type="checkbox"
                      checked={settings.gstEnabled}
                      onChange={(e) => setSettings({ ...settings, gstEnabled: e.target.checked })}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span className={`switch-slider ${settings.gstEnabled ? 'active' : ''}`} />
                  </label>
                </div>

                {settings.gstEnabled && (
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">GST Percentage (%)</label>
                    <input
                      type="number"
                      className="form-input"
                      min="0"
                      max="100"
                      step="0.1"
                      value={settings.gstPercentage}
                      onChange={(e) => setSettings({ ...settings, gstPercentage: Number(e.target.value) })}
                      required
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="card" style={{ marginBottom: 24 }}>
              <div className="card-header">
                <div className="card-title">💼 Handling Charges Settings</div>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Enable Handling Charges</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>If enabled, a fixed handling fee will be added to the order.</div>
                  </div>
                  <label className="switch-container" style={{ position: 'relative', display: 'inline-block', width: 48, height: 24 }}>
                    <input
                      type="checkbox"
                      checked={settings.handlingFeeEnabled}
                      onChange={(e) => setSettings({ ...settings, handlingFeeEnabled: e.target.checked })}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span className={`switch-slider ${settings.handlingFeeEnabled ? 'active' : ''}`} />
                  </label>
                </div>

                {settings.handlingFeeEnabled && (
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Handling Fee Amount (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      min="0"
                      value={settings.handlingFee}
                      onChange={(e) => setSettings({ ...settings, handlingFee: Number(e.target.value) })}
                      required
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="card" style={{ marginBottom: 24 }}>
              <div className="card-header">
                <div className="card-title">🌐 Language Settings</div>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Default App Language</label>
                  <select
                    className="form-input"
                    value={settings.defaultLanguage}
                    onChange={(e) => setSettings({ ...settings, defaultLanguage: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--bg-card)',
                      color: 'var(--text-main)',
                      fontSize: '14px',
                    }}
                  >
                    <option value="en">English</option>
                    <option value="hi">हिंदी (Hindi)</option>
                    <option value="mr">मराठी (Marathi)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="card" style={{ marginBottom: 24 }}>
              <div className="card-header">
                <div className="card-title">📞 Customer Care Settings</div>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Return / Support Contact Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={settings.contactNumber}
                    onChange={(e) => setSettings({ ...settings, contactNumber: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: 15 }} disabled={saving}>
              {saving ? 'Saving...' : '💾 Save Settings'}
            </button>
          </form>
        )}
      </div>

      <style jsx global>{`
        .switch-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: var(--bg-hover);
          border: 1px solid var(--border);
          transition: .3s;
          border-radius: 24px;
        }
        .switch-slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 3px;
          bottom: 3px;
          background-color: var(--text-secondary);
          transition: .3s;
          border-radius: 50%;
        }
        .switch-slider.active {
          background-color: var(--accent);
          border-color: var(--accent);
        }
        .switch-slider.active:before {
          transform: translateX(24px);
          background-color: #fff;
        }
      `}</style>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}
