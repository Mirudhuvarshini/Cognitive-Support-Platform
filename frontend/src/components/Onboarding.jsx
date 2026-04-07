import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const conditionsList = ['ADHD', 'Autism Spectrum Disorder', 'Dyslexia', 'Dyspraxia', 'Dyscalculia', 'Tourette Syndrome', 'Other'];

export default function Onboarding() {
    const navigate = useNavigate();
    const { updateProfile } = useAuth();
    const [step, setStep] = useState(1);
    const [age, setAge] = useState('');
    const [diagnosisStatus, setDiagnosisStatus] = useState(null);
    const [selectedConditions, setSelectedConditions] = useState([]);
    const [selectedSymptoms, setSelectedSymptoms] = useState([]);
    const [additionalNotes, setAdditionalNotes] = useState('');
    const [consent, setConsent] = useState({ audio: false, video: false, activity: false, anonymized: true, personalized: true });

    const handleNextStep1 = (status) => {
        setDiagnosisStatus(status);
        setStep(status === 'Yes' ? 2 : 3);
    };

    const handleNextStep2 = () => setStep(5);
    const handleNextAge = () => { if (age.trim()) setStep(4); };
    const handleNextSymptoms = () => setStep(5);

    const toggleSymptom = (s) => setSelectedSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
    const toggleCondition = (c) => setSelectedConditions(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
    const toggleConsent = (key) => setConsent(prev => ({ ...prev, [key]: !prev[key] }));

    const handleFinishConsent = async () => {
        await updateProfile({
            diagnosis_status: diagnosisStatus,
            conditions: selectedConditions,
            age: parseInt(age) || null,
            symptoms: selectedSymptoms,
            additional_notes: additionalNotes,
            consent_audio: consent.audio,
            consent_video: consent.video,
            consent_activity: consent.activity,
        });
        setStep(6);
    };

    const renderStep1 = () => (
        <div className="onboarding-step animate-fade-in">
            <h2>Let's personalize your experience</h2>
            <p className="subtitle">Have you been formally diagnosed with a neurodivergent condition?</p>
            <div className="options-grid">
                {['Yes', 'No', 'Not Sure'].map(opt => (
                    <button key={opt} className={`selection-card ${diagnosisStatus === opt ? 'selected' : ''}`} onClick={() => handleNextStep1(opt)}>{opt}</button>
                ))}
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="onboarding-step animate-fade-in">
            <h2>Which conditions apply to you?</h2>
            <p className="subtitle">You can select more than one.</p>
            <div className="conditions-grid">
                {conditionsList.map(cond => (
                    <button key={cond} className={`pill-btn ${selectedConditions.includes(cond) ? 'selected' : ''}`} onClick={() => toggleCondition(cond)}>
                        {cond} {selectedConditions.includes(cond) && <CheckCircle2 size={16} />}
                    </button>
                ))}
            </div>
            <button className="btn-primary complete-btn" onClick={handleNextStep2} disabled={selectedConditions.length === 0}>
                Continue <ChevronRight />
            </button>
        </div>
    );

    const renderStep3 = () => (
        <div className="onboarding-step animate-fade-in">
            <h2>Patient Information</h2>
            <p className="subtitle">Let's start with some basic details to personalize your experience.</p>
            <div className="input-group" style={{ maxWidth: '300px', margin: '0 auto 2rem auto', textAlign: 'left' }}>
                <label>What is the patient's age?</label>
                <div className="input-wrap">
                    <input type="number" placeholder="e.g. 24" value={age} onChange={(e) => setAge(e.target.value)} min="1" max="120" />
                </div>
            </div>
            <button className="btn-primary complete-btn mx-auto mt-4" onClick={handleNextAge} disabled={!age.trim()}>Continue <ChevronRight /></button>
        </div>
    );

    const renderStep4 = () => (
        <div className="onboarding-step animate-fade-in" style={{ textAlign: 'left' }}>
            <h2>Behavioral Changes</h2>
            <p className="subtitle">Please select any behavioral changes you've noticed.</p>
            <div className="symptoms-grid">
                {['Withdrawal from social activities', 'Changes in sleep patterns', 'Changes in appetite/eating habits', 'Increased irritability', 'Decreased motivation', 'Difficulty completing daily tasks', 'Changes in communication style', 'Increased anxiety in specific situations', 'Emotional regulation difficulties', 'Other'].map(symptom => (
                    <label key={symptom} className="checkbox-label">
                        <input type="checkbox" checked={selectedSymptoms.includes(symptom)} onChange={() => toggleSymptom(symptom)} />
                        <span>{symptom}</span>
                    </label>
                ))}
            </div>
            <div className="input-group mt-4">
                <label>Additional Notes</label>
                <textarea className="notes-textarea" placeholder="Any other symptoms or details..." value={additionalNotes} onChange={(e) => setAdditionalNotes(e.target.value)} rows="4" />
            </div>
            <button className="btn-primary complete-btn mt-4 full-width" onClick={handleNextSymptoms}>Continue</button>
        </div>
    );

    const renderStep5 = () => (
        <div className="onboarding-step animate-fade-in text-left" style={{ textAlign: 'left' }}>
            <div className="disclaimer-alert mb-4">
                <AlertCircle size={24} color="#eab308" />
                <div>
                    <strong>Why we need your consent</strong>
                    <p style={{ margin: 0 }}>Neural Compass uses your data to provide personalized support. You can customize which data you're comfortable sharing.</p>
                </div>
            </div>
            <div className="consent-list mt-4">
                {[
                    { key: 'audio', title: 'Audio Processing', desc: 'Allow voice input for hands-free operation and tone analysis' },
                    { key: 'video', title: 'Video Processing', desc: 'Allow facial expression analysis to understand your needs' },
                    { key: 'activity', title: 'Activity Tracking', desc: 'Track app usage to improve your experience' },
                    { key: 'anonymized', title: 'Anonymized Data', desc: 'Share anonymized data to improve services (required)', disabled: true },
                    { key: 'personalized', title: 'Personalized Experience', desc: 'Receive tailored content based on your profile' },
                ].map(item => (
                    <div key={item.key} className="consent-item">
                        <div className="consent-text"><h4>{item.title}</h4><p>{item.desc}</p></div>
                        <label className="switch">
                            <input type="checkbox" checked={consent[item.key]} onChange={() => !item.disabled && toggleConsent(item.key)} disabled={item.disabled} />
                            <span className={`slider round ${item.disabled ? 'disabled' : ''}`}></span>
                        </label>
                    </div>
                ))}
            </div>
            <button className="btn-primary complete-btn mt-4 full-width" onClick={handleFinishConsent}>Save Preferences & Continue</button>
        </div>
    );

    const renderStep6 = () => (
        <div className="onboarding-step text-center animate-fade-in">
            <div className="success-icon mb-4"><CheckCircle2 size={64} color="var(--color-primary)" /></div>
            <h2>Setup Complete!</h2>
            {diagnosisStatus !== 'Yes' && (
                <div className="disclaimer-alert mx-auto mt-4 mb-4" style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)' }}>
                    <AlertCircle size={24} color="var(--color-primary)" />
                    <p>Your responses suggest traits related to neurodivergent conditions. <strong>This is not a medical diagnosis.</strong> Please consult a healthcare professional.</p>
                </div>
            )}
            <p className="subtitle mt-4 mb-6">We've tailored your dashboard based on your profile.</p>
            <button className="btn-primary mx-auto" onClick={() => navigate('/dashboard')} style={{ borderRadius: '50px' }}>Go to Dashboard</button>
        </div>
    );

    return (
        <div className="container auth-container">
            <div className="glass-card onboarding-card">
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${(step / 6) * 100}%` }}></div></div>
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {step === 4 && renderStep4()}
                {step === 5 && renderStep5()}
                {step === 6 && renderStep6()}
            </div>
        </div>
    );
}
