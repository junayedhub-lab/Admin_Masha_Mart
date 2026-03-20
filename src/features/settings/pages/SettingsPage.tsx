import { useState } from 'react';
import { Shield, Truck, CreditCard, Globe } from 'lucide-react';
import { adminConfig } from '../../../config/adminConfig';
import { formatCurrency } from '../../../lib/utils';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('app');

  const tabs = [
    { id: 'app', label: 'App Config', icon: Globe },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'shipping', label: 'Shipping', icon: Truck },
    { id: 'admins', label: 'Admin Users', icon: Shield },
  ];

  return (
    <div className="space-y-5 fade-in">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Configure your store</p>
      </div>

      <div className="flex gap-5">
        {/* Tabs */}
        <div className="w-56 flex-shrink-0">
          <div className="card divide-y divide-slate-100 overflow-hidden">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-pink-50 text-pink-600 border-l-2 border-pink-500'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'app' && (
            <div className="card p-6 space-y-5">
              <h3 className="text-sm font-semibold text-slate-800 border-b pb-3 border-slate-100">
                App Configuration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">App Name</label>
                  <input type="text" defaultValue={adminConfig.brand.app_name} className="form-input" />
                </div>
                <div>
                  <label className="form-label">Support Email</label>
                  <input type="email" defaultValue={adminConfig.brand.support_email} className="form-input" />
                </div>
                <div>
                  <label className="form-label">Support Phone</label>
                  <input type="text" defaultValue={adminConfig.brand.support_phone} className="form-input" />
                </div>
                <div>
                  <label className="form-label">Website URL</label>
                  <input type="url" defaultValue={adminConfig.brand.website_url} className="form-input" />
                </div>
              </div>
              <div className="flex justify-end">
                <button onClick={() => toast.success('Settings saved')} className="btn btn-primary">Save Changes</button>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="card p-6 space-y-5">
              <h3 className="text-sm font-semibold text-slate-800 border-b pb-3 border-slate-100">
                Payment Methods
              </h3>
              <div className="space-y-3">
                {adminConfig.payments.methods.map(method => (
                  <div key={method.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <CreditCard size={18} className="text-slate-400" />
                      <div>
                        <p className="text-sm font-semibold text-slate-700">{method.label}</p>
                        <p className="text-[10px] text-slate-400 uppercase">{method.id}</p>
                      </div>
                    </div>
                    <span className={`badge text-[10px] ${method.enabled ? 'badge-success' : 'badge-danger'}`}>
                      {method.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="card p-6 space-y-5">
              <h3 className="text-sm font-semibold text-slate-800 border-b pb-3 border-slate-100">
                Shipping Zones
              </h3>
              <table className="admin-table">
                <thead><tr><th>Zone</th><th>Fee</th><th>Est. Days</th></tr></thead>
                <tbody>
                  {adminConfig.shipping.zones.map(zone => (
                    <tr key={zone.name}>
                      <td className="text-sm font-medium text-slate-700">{zone.name}</td>
                      <td className="text-sm">{formatCurrency(zone.base_fee)}</td>
                      <td className="text-sm text-slate-500">{zone.estimated_days} days</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-slate-500">
                Free shipping above: {formatCurrency(adminConfig.shipping.free_shipping_above)}
              </p>
            </div>
          )}

          {activeTab === 'admins' && (
            <div className="card p-6 space-y-5">
              <h3 className="text-sm font-semibold text-slate-800 border-b pb-3 border-slate-100">
                Admin Users
              </h3>
              <div className="empty-state py-12">
                <div className="empty-state-icon"><Shield size={24} /></div>
                <h3 className="text-sm font-semibold text-slate-700">Admin management</h3>
                <p className="text-xs text-slate-500 mt-1">Manage admin users and roles here.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
