import React, { useState } from 'react';
import { HelpCircle, X, Search, MessageSquare, BookOpen } from 'lucide-react';
import manualData from '../data/manual_knowledge.json';

export const HelpAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.toLowerCase();
    
    if (query.includes('login') || query.includes('password')) {
      setAnswer(manualData.getting_started.login);
    } else if (query.includes('property') || query.includes('add')) {
      setAnswer(manualData.manager_guide.managing_properties);
    } else if (query.includes('tenant') || query.includes('lease')) {
      setAnswer(manualData.manager_guide.tenant_management);
    } else if (query.includes('report') || query.includes('export')) {
      setAnswer(manualData.manager_guide.financial_reports);
    } else if (query.includes('maintenance') || query.includes('request')) {
      setAnswer(manualData.tenant_guide.maintenance);
    } else if (query.includes('security') || query.includes('data')) {
      setAnswer(manualData.security.data_protection);
    } else if (query.includes('support') || query.includes('contact')) {
      setAnswer(manualData.support.contact);
    } else {
      setAnswer("I couldn't find a specific answer in the manual. Try searching for 'login', 'properties', 'tenants', or 'maintenance'.");
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-2xl shadow-blue-600/40 hover:scale-110 transition-transform"
      >
        {isOpen ? <X className="text-white" /> : <HelpCircle className="text-white" />}
      </button>

      {isOpen && (
        <div className="absolute bottom-20 right-0 w-96 bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-[32px] shadow-2xl overflow-hidden">
          <div className="p-6 bg-blue-600/20 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen size={18} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white">Rentala Assistant</h3>
                <p className="text-[10px] text-blue-400 uppercase tracking-widest font-bold">Manual Knowledge Base</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="How do I add a property?"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm outline-none focus:border-blue-500/50 transition-all text-white"
              />
            </form>

            {answer ? (
              <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <MessageSquare size={18} className="text-blue-400 mt-1 shrink-0" />
                  <p className="text-sm text-slate-200 leading-relaxed">{answer}</p>
                </div>
                <button onClick={() => setAnswer(null)} className="mt-4 text-xs text-blue-400 font-bold hover:underline">Ask another question</button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Suggested Topics</p>
                <div className="grid grid-cols-2 gap-2">
                  {['Login Security', 'Adding Properties', 'Tenant Leases', 'Maintenance'].map((topic) => (
                    <button 
                      key={topic}
                      onClick={() => {
                        setSearchQuery(topic);
                        const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
                        setTimeout(() => handleSearch(fakeEvent), 10);
                      }}
                      className="text-left p-3 bg-white/5 border border-white/10 rounded-xl text-xs hover:bg-white/10 transition-colors text-slate-300"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
