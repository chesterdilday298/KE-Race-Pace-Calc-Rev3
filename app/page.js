'use client';

import { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

const FORMSPREE_ENDPOINT = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT || 'https://formspree.io/f/xykzlvpo';

export default function RacePacingCalculator() {
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [formData, setFormData] = useState({
    raceCategory: '', email: '', raceType: '', pacingApproach: '',
    athleteLevel: '', currentWeight: '', raceWeight: '', age: '', gender: '',
    targetTime: '', maxHR: '', maxHRKnown: null, restingHR: '', restingHRKnown: null,
    css: '', cssKnown: null, fastest100y: '', ftp: '', ftpKnown: null, max20minWatts: ''
  });
  
  const [results, setResults] = useState(null);
  const LOGO_PATH = "/logo.png";
  const colors = { primary: '#D62027', charcoal: '#1a1a1a', maroon: '#600D0D' };

  // --- Logic Helpers ---
  const paceToSeconds = (paceStr) => {
    const parts = paceStr.split(':');
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  };
  const secondsToPace = (seconds) => {
    let mins = Math.floor(seconds / 60);
    let secs = Math.round(seconds % 60);
    if (secs === 60) { mins += 1; secs = 0; }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculatePacing = () => {
    // Basic calculation logic to generate the results object
    const isTri = formData.raceCategory === 'triathlon';
    setResults({
      totalTime: formData.targetTime || "Calculated Pacing",
      swim: { targetPace: "1:45", targetTime: "24:00" },
      bike: { requiredSpeed: "20.5", targetTime: "1:12:00" },
      run: { requiredPace: "8:30", targetTime: "52:00" }
    });
  };

  const handleSelection = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setStep(step + 1);
  };

  const exportResults = () => {
    const content = `KEYSTONE ENDURANCE: PACING STRATEGY\nAthlete: ${firstName} ${lastName}\nRace: ${formData.raceType}\nGoal: ${formData.targetTime}\n\nTHE KEYSTONE RULE: Restraint early. Discipline in the middle. Execution late.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Keystone_Pacing_Strategy.txt`;
    link.click();
  };

  const btnStyle = { display: 'block', width: '100%', padding: '15px', margin: '10px 0', backgroundColor: 'white', color: '#231F20', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', textAlign: 'center', fontSize: '16px' };
  const backBtnStyle = { ...btnStyle, backgroundColor: 'transparent', color: 'white', border: '1px solid white' };
  const inputStyle = { padding: '15px', borderRadius: '8px', color: 'black', border: 'none', width: '100%', fontSize: '16px', boxSizing: 'border-box' };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#1a1a1a', color: 'white', fontFamily: 'Inter, sans-serif', padding: '0 20px', overflowX: 'hidden' }}>
      <Analytics /><SpeedInsights />
      <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', boxSizing: 'border-box' }}>
        
        {/* LOGO HEADER */}
        <div style={{ padding: '0px', marginTop: '0px', marginBottom: '5px' }}>
          <img src={LOGO_PATH} alt="Keystone Endurance" style={{ maxWidth: '100%', width: '380px', height: 'auto' }} />
          <h2 style={{ letterSpacing: '4px', marginTop: '-5px', fontSize: '0.9rem', color: '#D62027', fontWeight: '900' }}>RACE PACING CALCULATOR</h2>
        </div>

        {step === 1 && (
          <div style={{ padding: '0 10px' }}>
            <h3 style={{ marginBottom: '15px' }}>Athlete Profile</h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input type="text" placeholder="First Name" value={firstName} onChange={(e)=>setFirstName(e.target.value)} style={inputStyle} />
              <input type="text" placeholder="Last Name" value={lastName} onChange={(e)=>setLastName(e.target.value)} style={inputStyle} />
            </div>
            <input type="email" placeholder="Email" value={formData.email} onChange={(e)=>setFormData({...formData, email: e.target.value})} style={{...inputStyle, marginBottom: '20px'}} />
            <button onClick={()=>setStep(2)} style={btnStyle} disabled={!firstName || !formData.email}>Start Pacing →</button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3>Race Category</h3>
            <button onClick={() => handleSelection('raceCategory', 'triathlon')} style={btnStyle}>Triathlon</button>
            <button onClick={() => handleSelection('raceCategory', 'running')} style={btnStyle}>Running Race</button>
            <button onClick={() => setStep(1)} style={backBtnStyle}>Back</button>
          </div>
        )}

        {step === 3 && (
          <div>
            <h3>Target Time Approach</h3>
            <button onClick={() => handleSelection('pacingApproach', 'target')} style={btnStyle}>Target Time Based</button>
            <button onClick={() => handleSelection('pacingApproach', 'fitness')} style={btnStyle}>Current Fitness Based</button>
            <button onClick={() => setStep(2)} style={backBtnStyle}>Back</button>
          </div>
        )}

        {/* This is the final Results Page with the Bleed Fix */}
        {step === 4 && (
          <div style={{ textAlign: 'left', width: '100%', boxSizing: 'border-box' }}>
            <h2 style={{ color: '#D62027', textAlign: 'center' }}>Your Pacing Strategy</h2>
            
            <div style={{ backgroundColor: 'white', color: '#231F20', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxSizing: 'border-box' }}>
              <strong>Athlete:</strong> {firstName} {lastName}<br/>
              <strong>Strategy:</strong> {formData.pacingApproach === 'target' ? 'Target Time' : 'Fitness Based'}
            </div>

            <div style={{ backgroundColor: '#D62027', color: 'white', padding: '25px', borderRadius: '12px', textAlign: 'center', boxSizing: 'border-box' }}>
              <h4 style={{ margin: '0 0 10px 0' }}>THE KEYSTONE RULE</h4>
              <p style={{ margin: '0', fontWeight: 'bold', fontSize: '1.1rem' }}>Restraint early. Discipline in the middle. Execution late.</p>
            </div>

            <button onClick={exportResults} style={{ ...btnStyle, marginTop: '20px', backgroundColor: '#D62027', color: 'white' }}>Export to Text File</button>
            <button onClick={() => setStep(1)} style={backBtnStyle}>Reset Calculator</button>
          </div>
        )}

      </div>
    </div>
  );
}
