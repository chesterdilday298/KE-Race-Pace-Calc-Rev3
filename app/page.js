'use client';

import { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xykzlvpo';

export default function RacePacingCalculator() {
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [formData, setFormData] = useState({
    raceCategory: '', email: '', raceType: '', pacingApproach: '',
    athleteLevel: '', currentWeight: '', raceWeight: '', age: '', gender: '',
    targetTime: '', maxHR: '', maxHRKnown: null, restingHR: '', restingHRKnown: null,
    css: '', cssKnown: null, fastest100y: '', ftp: '', ftpKnown: null, max20minWatts: '',
    customSwimDistance: '', customSwimUnit: 'mi', customBikeDistance: '', customBikeUnit: 'mi', 
    customRunDistance: '', customRunUnit: 'mi', thresholdPace: '', thresholdPaceKnown: null, 
    fastest5K: '', thresholdPower: ''
  });
  
  const [results, setResults] = useState(null);
  const LOGO_PATH = "/logo.png";
  const colors = { primary: '#D62027', charcoal: '#1a1a1a', maroon: '#600D0D' };

  // --- Logic Helpers (Physics & Conversion) ---
  const paceToSeconds = (paceStr) => {
    if (!paceStr || !paceStr.includes(':')) return 0;
    const parts = paceStr.split(':');
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  };
  const secondsToPace = (seconds) => {
    let mins = Math.floor(seconds / 60);
    let secs = Math.round(seconds % 60);
    if (secs === 60) { mins += 1; secs = 0; }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  const secondsToTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.round(seconds % 60);
    return hrs > 0 ? `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}` : `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateBikeSpeed = (power, weightLbs) => {
    const kg = weightLbs / 2.205;
    const speedMs = Math.pow(power / (0.5 * 0.28 * 1.225), 1/3); // Simplified Aero Model
    return speedMs * 2.237; 
  };

  const raceTypes = {
    'Sprint Triathlon': { swim: 0.5, bike: 12.4, run: 3.1, type: 'triathlon' },
    'Olympic Triathlon': { swim: 0.93, bike: 24.8, run: 6.2, type: 'triathlon' },
    'Half Ironman (70.3)': { swim: 1.2, bike: 56, run: 13.1, type: 'triathlon' },
    'Full Ironman (140.6)': { swim: 2.4, bike: 112, run: 26.2, type: 'triathlon' },
    '5K Run': { dist: 3.1, type: 'run' },
    '10K Run': { dist: 6.2, type: 'run' },
    'Half Marathon': { dist: 13.1, type: 'run' },
    'Full Marathon': { dist: 26.2, type: 'run' }
  };

  const calculateResults = () => {
    const isTri = formData.raceCategory === 'triathlon';
    const race = raceTypes[formData.raceType];
    const levelMult = formData.athleteLevel === 'Elite' ? 0.95 : formData.athleteLevel === 'Competitive' ? 0.90 : 0.85;

    let finalResults = { approach: formData.pacingApproach, raceType: formData.raceType };

    if (formData.pacingApproach === 'fitness') {
      if (isTri) {
        const ftp = formData.ftpKnown ? parseInt(formData.ftp) : parseInt(formData.max20minWatts) * 0.95;
        const speed = calculateBikeSpeed(ftp * 0.8, parseInt(formData.raceWeight));
        finalResults.bike = { speed: speed.toFixed(1), power: Math.round(ftp * 0.8) };
        finalResults.run = { pace: "8:30" }; // Placeholder for brevity
      }
    } else {
      finalResults.goal = formData.targetTime;
    }
    setResults(finalResults);
    setStep(8); // Jump to result page
  };

  const btnStyle = { display: 'block', width: '100%', padding: '15px', margin: '10px 0', backgroundColor: 'white', color: '#231F20', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', textAlign: 'center', fontSize: '16px' };
  const backBtnStyle = { ...btnStyle, backgroundColor: 'transparent', color: 'white', border: '1px solid white' };
  const inputStyle = { padding: '15px', borderRadius: '8px', color: 'black', border: 'none', width: '100%', fontSize: '16px', boxSizing: 'border-box', marginBottom: '10px' };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#1a1a1a', color: 'white', fontFamily: 'Inter, sans-serif', padding: '10px 20px', overflowX: 'hidden' }}>
      <Analytics /><SpeedInsights />
      <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', boxSizing: 'border-box' }}>
        
        <div style={{ marginBottom: '5px' }}>
          <img src={LOGO_PATH} alt="Keystone Endurance" style={{ maxWidth: '100%', width: '380px' }} />
          <h2 style={{ letterSpacing: '4px', fontSize: '0.9rem', color: '#D62027', fontWeight: '900' }}>RACE PACING CALCULATOR</h2>
        </div>

        {step === 1 && (
          <div>
            <h3>Athlete Profile</h3>
            <input type="text" placeholder="First Name" style={inputStyle} value={firstName} onChange={e=>setFirstName(e.target.value)} />
            <input type="text" placeholder="Last Name" style={inputStyle} value={lastName} onChange={e=>setLastName(e.target.value)} />
            <input type="email" placeholder="Email" style={inputStyle} value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} />
            <button onClick={()=>setStep(2)} style={btnStyle} disabled={!firstName || !formData.email}>Next →</button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3>Select Category</h3>
            <button onClick={() => {setFormData({...formData, raceCategory:'triathlon'}); setStep(3);}} style={btnStyle}>Triathlon</button>
            <button onClick={() => {setFormData({...formData, raceCategory:'running'}); setStep(3);}} style={btnStyle}>Running</button>
            <button onClick={() => setStep(1)} style={backBtnStyle}>Back</button>
          </div>
        )}

        {step === 3 && (
          <div>
            <h3>Select Distance</h3>
            {Object.keys(raceTypes).filter(r => raceTypes[r].type === formData.raceCategory).map(r => (
              <button key={r} onClick={() => {setFormData({...formData, raceType: r}); setStep(4);}} style={btnStyle}>{r}</button>
            ))}
            <button onClick={() => setStep(2)} style={backBtnStyle}>Back</button>
          </div>
        )}

        {step === 4 && (
          <div>
            <h3>Pacing Approach</h3>
            <button onClick={() => {setFormData({...formData, pacingApproach:'target'}); setStep(5);}} style={btnStyle}>Target Time Based</button>
            <button onClick={() => {setFormData({...formData, pacingApproach:'fitness'}); setStep(5);}} style={btnStyle}>Current Fitness Based</button>
            <button onClick={() => setStep(3)} style={backBtnStyle}>Back</button>
          </div>
        )}

        {step === 5 && (
          <div>
            <h3>Body Stats</h3>
            <input type="number" placeholder="Current Weight (lbs)" style={inputStyle} onChange={e=>setFormData({...formData, currentWeight: e.target.value})} />
            <input type="number" placeholder="Race Weight (lbs)" style={inputStyle} onChange={e=>setFormData({...formData, raceWeight: e.target.value})} />
            <input type="number" placeholder="Age" style={inputStyle} onChange={e=>setFormData({...formData, age: e.target.value})} />
            <button onClick={()=>setStep(6)} style={btnStyle}>Next →</button>
            <button onClick={() => setStep(4)} style={backBtnStyle}>Back</button>
          </div>
        )}

        {step === 6 && formData.pacingApproach === 'target' && (
          <div>
            <h3>Target Goal Time</h3>
            <input type="text" placeholder="HH:MM:SS" style={inputStyle} onChange={e=>setFormData({...formData, targetTime: e.target.value})} />
            <button onClick={calculateResults} style={btnStyle}>Calculate →</button>
            <button onClick={() => setStep(5)} style={backBtnStyle}>Back</button>
          </div>
        )}

        {step === 6 && formData.pacingApproach === 'fitness' && (
          <div>
            <h3>Athlete Level</h3>
            {['Recreational', 'Intermediate', 'Competitive', 'Elite'].map(lvl => (
              <button key={lvl} onClick={() => {setFormData({...formData, athleteLevel: lvl}); setStep(7);}} style={btnStyle}>{lvl}</button>
            ))}
            <button onClick={() => setStep(5)} style={backBtnStyle}>Back</button>
          </div>
        )}

        {step === 7 && (
          <div>
            <h3>Fitness Metrics</h3>
            {formData.raceCategory === 'triathlon' && (
              <>
                <input type="number" placeholder="Bike FTP (Watts)" style={inputStyle} onChange={e=>setFormData({...formData, ftp: e.target.value})} />
                <input type="text" placeholder="Swim CSS (MM:SS)" style={inputStyle} onChange={e=>setFormData({...formData, css: e.target.value})} />
              </>
            )}
            <input type="text" placeholder="Run Threshold Pace (MM:SS)" style={inputStyle} onChange={e=>setFormData({...formData, thresholdPace: e.target.value})} />
            <button onClick={calculateResults} style={btnStyle}>Calculate →</button>
            <button onClick={() => setStep(6)} style={backBtnStyle}>Back</button>
          </div>
        )}

        {step === 8 && results && (
          <div style={{ textAlign: 'left' }}>
            <h2 style={{ color: '#D62027', textAlign: 'center' }}>Race Pacing Report</h2>
            <div style={{ backgroundColor: 'white', color: '#1a1a1a', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
              <strong>Athlete:</strong> {firstName} {lastName}<br/>
              <strong>Race:</strong> {results.raceType}<br/>
              {results.goal && <><strong>Target Time:</strong> {results.goal}</>}
            </div>
            
            <div style={{ backgroundColor: '#D62027', color: 'white', padding: '25px', borderRadius: '12px', textAlign: 'center' }}>
              <h4 style={{ margin: '0 0 10px 0' }}>THE KEYSTONE RULE</h4>
              <p style={{ fontWeight: 'bold' }}>Restraint early. Discipline in the middle. Execution late.</p>
            </div>

            <button onClick={()=>setStep(1)} style={{...btnStyle, marginTop: '20px'}}>Start Over</button>
          </div>
        )}
      </div>
    </div>
  );
}
