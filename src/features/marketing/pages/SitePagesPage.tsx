import { useState, useEffect } from 'react';
import { Save, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import toast from 'react-hot-toast';
import { cn } from '../../../lib/utils';

export default function SitePagesPage() {
  const [activeTab, setActiveTab] = useState<'shipping' | 'returns' | 'faq' | 'about'>('shipping');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [shippingData, setShippingData] = useState<any>(null);
  const [returnsData, setReturnsData] = useState<any>(null);
  const [faqData, setFaqData] = useState<any>(null);
  const [aboutData, setAboutData] = useState<any>(null);

  useEffect(() => {
    fetchConfigs();
  }, []);

  async function fetchConfigs() {
    setLoading(true);
    const { data } = await supabase.from('app_config').select('*').in('key', ['page_shipping', 'page_returns', 'page_faq', 'page_about']);
    if (data) {
      setShippingData(data.find((d: any) => d.key === 'page_shipping')?.value || {});
      setReturnsData(data.find((d: any) => d.key === 'page_returns')?.value || {});
      setFaqData(data.find((d: any) => d.key === 'page_faq')?.value || {});
      setAboutData(data.find((d: any) => d.key === 'page_about')?.value || {});
    }
    setLoading(false);
  }

  async function handleSave(key: string, value: any) {
    setSaving(true);
    const { error } = await supabase.from('app_config').upsert({ key, value });
    if (error) {
      toast.error('Failed to save configuration');
    } else {
      toast.success('Configuration saved successfully');
    }
    setSaving(false);
  }

  if (loading) return <div className="flex justify-center py-20"><div className="spinner" /></div>;

  return (
    <div className="space-y-6 fade-in max-w-5xl">
      <div>
        <h1 className="page-title">Site Pages</h1>
        <p className="page-subtitle">Manage static page content for your shop</p>
      </div>

      <div className="flex p-1 bg-slate-100 rounded-xl w-fit">
        {['shipping', 'returns', 'faq', 'about'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-bold transition-all capitalize",
              activeTab === tab ? "bg-white text-pink-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="card p-6">
        {/* Shipping Tab */}
        {activeTab === 'shipping' && shippingData && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Shipping & Delivery Settings</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div><label className="form-label">Page Title</label><input type="text" value={shippingData.title || ''} onChange={e => setShippingData({...shippingData, title: e.target.value})} className="form-input" /></div>
              <div><label className="form-label">Page Subtitle</label><input type="text" value={shippingData.subtitle || ''} onChange={e => setShippingData({...shippingData, subtitle: e.target.value})} className="form-input" /></div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="space-y-3">
                <h4 className="font-bold text-slate-700">Inside Dhaka</h4>
                <div><label className="form-label text-xs">Time</label><input type="text" value={shippingData.inside_dhaka?.time || ''} onChange={e => setShippingData({...shippingData, inside_dhaka: {...shippingData.inside_dhaka, time: e.target.value}})} className="form-input" /></div>
                <div><label className="form-label text-xs">Charge</label><input type="text" value={shippingData.inside_dhaka?.charge || ''} onChange={e => setShippingData({...shippingData, inside_dhaka: {...shippingData.inside_dhaka, charge: e.target.value}})} className="form-input" /></div>
              </div>
              <div className="space-y-3">
                <h4 className="font-bold text-slate-700">Outside Dhaka</h4>
                <div><label className="form-label text-xs">Time</label><input type="text" value={shippingData.outside_dhaka?.time || ''} onChange={e => setShippingData({...shippingData, outside_dhaka: {...shippingData.outside_dhaka, time: e.target.value}})} className="form-input" /></div>
                <div><label className="form-label text-xs">Charge</label><input type="text" value={shippingData.outside_dhaka?.charge || ''} onChange={e => setShippingData({...shippingData, outside_dhaka: {...shippingData.outside_dhaka, charge: e.target.value}})} className="form-input" /></div>
              </div>
            </div>

            <div><label className="form-label">Processing Note</label><textarea value={shippingData.processing_note || ''} onChange={e => setShippingData({...shippingData, processing_note: e.target.value})} className="form-input min-h-[100px]" /></div>
            <div><label className="form-label">Special Note (Perishables)</label><textarea value={shippingData.special_note || ''} onChange={e => setShippingData({...shippingData, special_note: e.target.value})} className="form-input min-h-[80px]" /></div>
            
            <button onClick={() => handleSave('page_shipping', shippingData)} disabled={saving} className="btn btn-primary"><Save size={16} /> Save Changes</button>
          </div>
        )}

        {/* Returns Tab */}
        {activeTab === 'returns' && returnsData && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Returns & Refunds Settings</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div><label className="form-label">Page Title</label><input type="text" value={returnsData.title || ''} onChange={e => setReturnsData({...returnsData, title: e.target.value})} className="form-input" /></div>
              <div><label className="form-label">Page Subtitle</label><input type="text" value={returnsData.subtitle || ''} onChange={e => setReturnsData({...returnsData, subtitle: e.target.value})} className="form-input" /></div>
            </div>
            
            <div><label className="form-label">Return Policy Text</label><textarea value={returnsData.policy_text || ''} onChange={e => setReturnsData({...returnsData, policy_text: e.target.value})} className="form-input min-h-[120px]" /></div>
            
            <div className="space-y-3">
              <h4 className="font-bold text-slate-700">Steps to Return</h4>
              {(returnsData.steps || []).map((step: any, idx: number) => (
                <div key={idx} className="flex gap-4 items-start bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="w-8 shrink-0"><input type="text" value={step.step} onChange={e => { const newSteps = [...returnsData.steps]; newSteps[idx].step = e.target.value; setReturnsData({...returnsData, steps: newSteps}); }} className="form-input text-center px-1" /></div>
                  <div className="flex-1 space-y-2">
                    <input type="text" placeholder="Title" value={step.title} onChange={e => { const newSteps = [...returnsData.steps]; newSteps[idx].title = e.target.value; setReturnsData({...returnsData, steps: newSteps}); }} className="form-input" />
                    <input type="text" placeholder="Description" value={step.desc} onChange={e => { const newSteps = [...returnsData.steps]; newSteps[idx].desc = e.target.value; setReturnsData({...returnsData, steps: newSteps}); }} className="form-input" />
                  </div>
                </div>
              ))}
            </div>

            <div><label className="form-label">Non-returnable Items Notice</label><textarea value={returnsData.non_returnable || ''} onChange={e => setReturnsData({...returnsData, non_returnable: e.target.value})} className="form-input min-h-[80px]" /></div>
            
            <button onClick={() => handleSave('page_returns', returnsData)} disabled={saving} className="btn btn-primary"><Save size={16} /> Save Changes</button>
          </div>
        )}

        {/* FAQ Tab */}
        {activeTab === 'faq' && faqData && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2">FAQ Settings</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div><label className="form-label">Page Title</label><input type="text" value={faqData.title || ''} onChange={e => setFaqData({...faqData, title: e.target.value})} className="form-input" /></div>
              <div><label className="form-label">Page Subtitle</label><input type="text" value={faqData.subtitle || ''} onChange={e => setFaqData({...faqData, subtitle: e.target.value})} className="form-input" /></div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-slate-700">FAQ Items</h4>
                <button onClick={() => setFaqData({...faqData, faqs: [...(faqData.faqs || []), {q: '', a: ''}]})} className="btn btn-ghost btn-sm text-pink-600"><Plus size={14}/> Add FAQ</button>
              </div>
              
              {(faqData.faqs || []).map((faq: any, idx: number) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex gap-4">
                  <div className="flex-1 space-y-3">
                    <div><label className="form-label text-xs">Question</label><input type="text" value={faq.q} onChange={e => { const newFaqs = [...faqData.faqs]; newFaqs[idx].q = e.target.value; setFaqData({...faqData, faqs: newFaqs}); }} className="form-input" /></div>
                    <div><label className="form-label text-xs">Answer</label><textarea value={faq.a} onChange={e => { const newFaqs = [...faqData.faqs]; newFaqs[idx].a = e.target.value; setFaqData({...faqData, faqs: newFaqs}); }} className="form-input min-h-[80px]" /></div>
                  </div>
                  <button onClick={() => { const newFaqs = faqData.faqs.filter((_: any, i: number) => i !== idx); setFaqData({...faqData, faqs: newFaqs}); }} className="mt-6 btn btn-ghost btn-icon text-red-500 hover:bg-red-50 shrink-0"><Trash2 size={16}/></button>
                </div>
              ))}
            </div>
            
            <button onClick={() => handleSave('page_faq', faqData)} disabled={saving} className="btn btn-primary"><Save size={16} /> Save Changes</button>
          </div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && aboutData && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2">About Us Settings</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div><label className="form-label">Hero Title</label><input type="text" value={aboutData.hero_title || ''} onChange={e => setAboutData({...aboutData, hero_title: e.target.value})} className="form-input" /></div>
              <div><label className="form-label">Hero Subtitle</label><textarea value={aboutData.hero_subtitle || ''} onChange={e => setAboutData({...aboutData, hero_subtitle: e.target.value})} className="form-input h-full min-h-[80px]" /></div>
            </div>
            
            <div><label className="form-label">Our Journey Text</label><textarea value={aboutData.journey_text || ''} onChange={e => setAboutData({...aboutData, journey_text: e.target.value})} className="form-input min-h-[150px]" /></div>
            
            <div className="space-y-4">
              <h4 className="font-bold text-slate-700">Core Values</h4>
              <div className="grid md:grid-cols-3 gap-4">
                {(aboutData.values || []).map((val: any, idx: number) => (
                  <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                    <div><label className="form-label text-xs">Title {idx + 1}</label><input type="text" value={val.title} onChange={e => { const newVals = [...aboutData.values]; newVals[idx].title = e.target.value; setAboutData({...aboutData, values: newVals}); }} className="form-input" /></div>
                    <div><label className="form-label text-xs">Description</label><textarea value={val.desc} onChange={e => { const newVals = [...aboutData.values]; newVals[idx].desc = e.target.value; setAboutData({...aboutData, values: newVals}); }} className="form-input text-xs min-h-[80px]" /></div>
                  </div>
                ))}
              </div>
            </div>
            
            <button onClick={() => handleSave('page_about', aboutData)} disabled={saving} className="btn btn-primary"><Save size={16} /> Save Changes</button>
          </div>
        )}
      </div>
    </div>
  );
}
