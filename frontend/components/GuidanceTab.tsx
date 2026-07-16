import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';

const STORAGE_KEY = 'vanility_curing_checks';

function getDefaultChecks(): Record<string, boolean> {
  return {
    b1: false, b2: false,
    s1: false, s2: false, s3: false,
    d1: false, d2: false, d3: false,
    c1: false, c2: false
  };
}

export default function GuidanceTab() {
  const [guideChecks, setGuideChecks] = useState<Record<string, boolean>>(() => {
    // Lazy initialization: read from localStorage synchronously on first render
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...getDefaultChecks(), ...parsed };
      }
    } catch (e) {
      console.error('Failed to load checklist state:', e);
    }
    return getDefaultChecks();
  });
  const [showCompleteAlert, setShowCompleteAlert] = useState(false);
  const hasShownAlert = useRef(false);

  // Persist to localStorage on every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(guideChecks));
  }, [guideChecks]);

  const handleCheckChange = (key: string) => {
    setGuideChecks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getGuideProgress = () => {
    const total = Object.keys(guideChecks).length;
    const checked = Object.values(guideChecks).filter(Boolean).length;
    return Math.round((checked / total) * 100);
  };

  // Track completion state — sets flag when progress hits 100%
  useEffect(() => {
    const progress = getGuideProgress();
    if (progress === 100 && !hasShownAlert.current) {
      hasShownAlert.current = true;
      setShowCompleteAlert(true);
    }
    if (progress < 100) {
      hasShownAlert.current = false;
    }
  }, [guideChecks]);

  // Show SweetAlert2 in a separate effect to decouple from state lifecycle
  useEffect(() => {
    if (!showCompleteAlert) return;
    Swal.fire({
      icon: 'success',
      title: 'Curing Checklist Complete!',
      html: '<p style="font-size: 14px; color: #3b2313;">All curing stages have been verified. Your vanilla batch is now aligned with <strong>SNI export standards</strong>.</p>',
      confirmButtonText: 'OK',
      confirmButtonColor: '#3b2313',
      background: '#fbf7ee',
      color: '#3b2313',
      iconColor: '#065f46',
      customClass: {
        popup: 'rounded-xl border-2',
        title: 'text-xl font-black',
        confirmButton: 'rounded-lg font-bold text-sm px-6 py-2',
      },
    }).then(() => {
      setShowCompleteAlert(false);
    });
  }, [showCompleteAlert]);

  return (
    <div className="space-y-6">
      <div className="relative border-2 border-primary-ink p-5 rounded-xl bg-card-cream cartoon-shadow-lg flex items-center justify-between">
        <span className="absolute -top-1.5 -left-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
        <span className="absolute -top-1.5 -right-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
        <span className="absolute -bottom-1.5 -left-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
        <span className="absolute -bottom-1.5 -right-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
        
        <div>
          <h3 className="font-retro text-[9px] tracking-wider text-accent-gold uppercase">Curing Process Checklist</h3>
          <p className="text-xs text-primary-ink/70 mt-1">Follow standard stages to secure premium quality vanilla beans compatible with export standards.</p>
        </div>
        <div className="text-right">
          <p className="font-retro text-[8px] tracking-wider text-accent-gold uppercase">Completion Progress</p>
          <p className="text-2xl font-black text-text-dark">{getGuideProgress()}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          {
            title: '1. Blanching (Pencelupan)',
            items: [
              { id: 'b1', label: 'Heat water strictly between 63 and 65 degrees Celsius.' },
              { id: 'b2', label: 'Immerse raw green vanilla pods for 2 to 3 minutes.' }
            ]
          },
          {
            title: '2. Sweating (Pemeraman)',
            items: [
              { id: 's1', label: 'Wrap hot beans in clean woolen fabrics.' },
              { id: 's2', label: 'Store in airtight sweating boxes to retain moisture.' },
              { id: 's3', label: 'Maintain sweating process for 10 to 15 days (traditional) or 4 to 8 days (controlled).' }
            ]
          },
          {
            title: '3. Sun Drying (Penjemuran)',
            items: [
              { id: 'd1', label: 'Spread vanilla pods under moderate sun for 2 to 3 hours daily.' },
              { id: 'd2', label: 'Cover with canvas during peak afternoon heat.' },
              { id: 'd3', label: 'Continue drying for 15 to 35 days until beans feel flexible and turn dark brown.' }
            ]
          },
          {
            title: '4. Conditioning (Penyimpanan)',
            items: [
              { id: 'c1', label: 'Store standard beans inside closed conditioning boxes lined with wax paper.' },
              { id: 'c2', label: 'Maintain storage for at least 45 days to allow aroma compounds to mature.' }
            ]
          }
        ].map((sec, idx) => (
          <div key={idx} className="relative border-2 border-primary-ink p-5 rounded-xl bg-card-cream cartoon-shadow-lg">
            <span className="absolute -top-1.5 -left-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
            <span className="absolute -top-1.5 -right-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
            <span className="absolute -bottom-1.5 -left-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
            <span className="absolute -bottom-1.5 -right-1.5 text-xs text-primary-ink font-mono leading-none font-bold">+</span>
            
            <h4 className="font-retro text-[8px] tracking-wider text-accent-gold uppercase mb-3 border-b-2 border-primary-ink/10 pb-1.5">{sec.title}</h4>
            <div className="space-y-3">
              {sec.items.map(item => (
                <label key={item.id} className="flex items-start space-x-3 text-xs cursor-pointer select-none font-medium">
                  <div className="relative flex items-center justify-center mt-0.5">
                    <input
                      type="checkbox"
                      checked={guideChecks[item.id]}
                      onChange={() => handleCheckChange(item.id)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 border-2 border-primary-ink rounded flex items-center justify-center transition-all shadow-[1px_1px_0_0_#3b2313] active:translate-y-0.5 active:shadow-none ${
                      guideChecks[item.id] ? 'bg-primary-ink text-card-cream' : 'bg-white'
                    }`}>
                      {guideChecks[item.id] && (
                        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className={guideChecks[item.id] ? 'line-through text-primary-ink/40 font-normal' : 'text-primary-ink/90'}>{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
