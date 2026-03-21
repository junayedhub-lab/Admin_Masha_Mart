import { useEffect, useState } from 'react';
import { Shield, Truck, Layout, Facebook, Mail, UserPlus, UserCheck, UserX } from 'lucide-react';
import { adminConfig } from '../../../config/adminConfig';
import { supabase } from '../../../lib/supabase';
import { cn } from '../../../lib/utils';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('shipping');

  const tabs = [
    { id: 'shipping', label: 'Shipping', icon: Truck },
    { id: 'footer', label: 'Footer & Links', icon: Layout },
    { id: 'pages', label: 'Legal Pages', icon: Shield },
    { id: 'admins', label: 'Admin Users', icon: Shield },
  ];

  // Shipping State
  const [shippingZones, setShippingZones] = useState(
    adminConfig.shipping.zones.filter(z => z.name !== 'Chittagong').map(z => ({ ...z }))
  );
  const [freeShippingAbove, setFreeShippingAbove] = useState<number>(adminConfig.shipping.free_shipping_above);

  const handleUpdateZone = (index: number, field: string, value: any) => {
    const newZones = [...shippingZones];
    newZones[index] = { ...newZones[index], [field]: value };
    setShippingZones(newZones);
  };

  const handleSaveShipping = () => {
    toast.success('Shipping settings saved successfully');
  };

  // Footer State
  const [footerConfig, setFooterConfig] = useState({
    support_email: 'support@mashamart.com',
    support_phone: '+880-1700-000000',
    office_address: '123 Green Road, Dhanmondi, Dhaka-1205',
    facebook_url: 'https://facebook.com/mashamart',
    instagram_url: 'https://instagram.com/mashamart',
    twitter_url: 'https://twitter.com/mashamart',
    youtube_url: 'https://youtube.com/mashamart',
  });

  const handleSaveFooter = () => {
    toast.success('Footer settings updated successfully');
  };

  // Legal Pages Content State
  const [legalPages, setLegalPages] = useState({
    privacy_policy: 'Our privacy policy describes how we collect and use your data...',
    terms_of_service: 'By using Masha Mart, you agree to the following terms...',
    shipping_policy: 'We ship across Bangladesh within 2-5 business days...',
    return_refund: 'Returns are accepted within 7 days of delivery for eligible items...',
  });

  const handleSavePages = () => {
    toast.success('Legal content updated successfully');
  };

  // Admin Management State
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);

  useEffect(() => {
    if (activeTab === 'admins') fetchAdminUsers();
  }, [activeTab]);

  async function fetchAdminUsers() {
    setLoadingAdmins(true);
    const { data } = await supabase.from('admin_users').select('*').order('created_at');
    if (data) setAdminUsers(data);
    setLoadingAdmins(false);
  }

  async function toggleAdminStatus(id: string, current: boolean) {
    const { error } = await supabase.from('admin_users').update({ is_active: !current }).eq('id', id);
    if (error) toast.error('Failed to update status');
    else {
      toast.success('Admin status updated');
      fetchAdminUsers();
    }
  }

  return (
    <div className="space-y-5 fade-in">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Configure your store</p>
      </div>

      <div className="flex gap-5">
        <div className="w-56 flex-shrink-0">
          <div className="card divide-y divide-slate-100 overflow-hidden">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors",
                  activeTab === tab.id ? 'bg-pink-50 text-pink-600 border-l-2 border-pink-500' : 'text-slate-600 hover:bg-slate-50'
                )}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          {activeTab === 'shipping' && (
            <div className="card p-6 space-y-6">
              <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                <h3 className="text-sm font-semibold text-slate-800">Shipping Zones</h3>
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Configured for Masha Mart</span>
              </div>
              <div className="space-y-4">
                {shippingZones.map((zone: any, idx: number) => (
                  <div key={zone.name} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-700">{zone.name}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="form-label text-[11px]">Base Fee (৳)</label>
                        <input type="number" value={zone.base_fee} onChange={(e) => handleUpdateZone(idx, 'base_fee', parseInt(e.target.value) || 0)} className="form-input" />
                      </div>
                      <div>
                        <label className="form-label text-[11px]">Est. Delivery Days</label>
                        <input type="text" value={zone.estimated_days} onChange={(e) => handleUpdateZone(idx, 'estimated_days', e.target.value)} className="form-input" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-slate-100">
                <div className="max-w-xs">
                  <label className="form-label">Free Shipping Threshold (৳)</label>
                  <input type="number" value={freeShippingAbove} onChange={(e) => setFreeShippingAbove(parseInt(e.target.value) || 0)} className="form-input" />
                </div>
              </div>
              <div className="flex justify-end pt-4"><button onClick={handleSaveShipping} className="btn btn-primary">Save Shipping Config</button></div>
            </div>
          )}

          {activeTab === 'footer' && (
            <div className="card p-6 space-y-8">
              <div>
                <h3 className="text-sm font-semibold text-slate-800 border-b pb-3 border-slate-100 flex items-center gap-2"><Mail size={16} className="text-rose-500" /> Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div><label className="form-label">Support Email</label><input type="email" value={footerConfig.support_email} onChange={e => setFooterConfig(f => ({ ...f, support_email: e.target.value }))} className="form-input" /></div>
                  <div><label className="form-label">Helpline Number</label><input type="text" value={footerConfig.support_phone} onChange={e => setFooterConfig(f => ({ ...f, support_phone: e.target.value }))} className="form-input" /></div>
                  <div className="md:col-span-2"><label className="form-label">Office Address</label><textarea value={footerConfig.office_address} onChange={e => setFooterConfig(f => ({ ...f, office_address: e.target.value }))} className="form-input" rows={2} /></div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-800 border-b pb-3 border-slate-100 flex items-center gap-2"><Facebook size={16} className="text-blue-600" /> Social Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div><label className="form-label">Facebook</label><input type="url" value={footerConfig.facebook_url} onChange={e => setFooterConfig(f => ({ ...f, facebook_url: e.target.value }))} className="form-input" /></div>
                  <div><label className="form-label">Instagram</label><input type="url" value={footerConfig.instagram_url} onChange={e => setFooterConfig(f => ({ ...f, instagram_url: e.target.value }))} className="form-input" /></div>
                  <div><label className="form-label">Twitter/X</label><input type="url" value={footerConfig.twitter_url} onChange={e => setFooterConfig(f => ({ ...f, twitter_url: e.target.value }))} className="form-input" /></div>
                  <div><label className="form-label">Youtube</label><input type="url" value={footerConfig.youtube_url} onChange={e => setFooterConfig(f => ({ ...f, youtube_url: e.target.value }))} className="form-input" /></div>
                </div>
              </div>
              <div className="flex justify-end pt-4"><button onClick={handleSaveFooter} className="btn btn-primary px-8">Save Footer Settings</button></div>
            </div>
          )}

          {activeTab === 'pages' && (
            <div className="card p-6 space-y-8">
              <h3 className="text-sm font-semibold text-slate-800 border-b pb-3 border-slate-100 italic">Manage Legal Content</h3>
              <div className="space-y-6">
                <div><label className="form-label font-bold">Privacy Policy</label><textarea value={legalPages.privacy_policy} onChange={e => setLegalPages(p => ({ ...p, privacy_policy: e.target.value }))} className="form-input" rows={6} /></div>
                <div><label className="form-label font-bold">Terms of Service</label><textarea value={legalPages.terms_of_service} onChange={e => setLegalPages(p => ({ ...p, terms_of_service: e.target.value }))} className="form-input" rows={6} /></div>
                <div className="grid grid-cols-2 gap-6">
                  <div><label className="form-label font-bold">Shipping Policy</label><textarea value={legalPages.shipping_policy} onChange={e => setLegalPages(p => ({ ...p, shipping_policy: e.target.value }))} className="form-input" rows={4} /></div>
                  <div><label className="form-label font-bold">Return Policy</label><textarea value={legalPages.return_refund} onChange={e => setLegalPages(p => ({ ...p, return_refund: e.target.value }))} className="form-input" rows={4} /></div>
                </div>
              </div>
              <div className="flex justify-end pt-4"><button onClick={handleSavePages} className="btn btn-primary px-8">Update Legal Pages</button></div>
            </div>
          )}

          {activeTab === 'admins' && (
            <div className="card p-0 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div><h3 className="text-sm font-semibold text-slate-800">Admin Users</h3><p className="text-[10px] text-slate-500 mt-0.5">Manage administrative accounts</p></div>
                <button onClick={() => toast.error('Invite logic coming soon')} className="btn btn-primary btn-sm gap-2"><UserPlus size={14} /> Invite Admin</button>
              </div>
              {loadingAdmins ? <div className="flex justify-center py-16"><div className="spinner" /></div> :
                <table className="admin-table text-xs">
                  <thead><tr><th>User</th><th>Role</th><th>Status</th><th>Last Login</th><th className="text-right">Actions</th></tr></thead>
                  <tbody>
                    {adminUsers.map(user => (
                      <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                        <td><div className="font-bold text-slate-700">{user.name || 'Admin'}</div><div className="text-[10px] text-slate-400">{user.email}</div></td>
                        <td><span className="badge badge-primary text-[8px] uppercase">{user.role}</span></td>
                        <td>{user.is_active ? <span className="text-emerald-500 flex items-center gap-1 font-bold"><UserCheck size={12}/>Active</span> : <span className="text-red-400 flex items-center gap-1 font-bold"><UserX size={12}/>Suspended</span>}</td>
                        <td className="text-slate-500">{user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never'}</td>
                        <td className="text-right"><button onClick={() => toggleAdminStatus(user.id, user.is_active)} className={cn("font-black uppercase text-[10px] px-2", user.is_active ? 'text-red-500' : 'text-emerald-500')}>{user.is_active ? 'Suspend' : 'Activate'}</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
