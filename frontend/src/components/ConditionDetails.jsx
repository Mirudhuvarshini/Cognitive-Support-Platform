import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, BookOpen, HeartPulse, Link as LinkIcon } from 'lucide-react';

const CONDITIONS_DATA = {
    adhd: {
        title: 'ADHD',
        fullTitle: 'Attention-Deficit/Hyperactivity Disorder',
        description: 'ADHD is a neurodevelopmental condition that affects the ability to focus, control impulses, and regulate energy levels. It manifests differently across individuals and can present as predominantly inattentive, predominantly hyperactive-impulsive, or combined type.',
        traits: ['Difficulty sustaining attention on tasks', 'Hyperactivity or restlessness', 'Impulsive decision-making', 'Time blindness and poor time management', 'Difficulty with organization', 'Hyperfocus on interests', 'Emotional dysregulation', 'Working memory challenges'],
        treatments: [
            { title: 'Behavioral Therapy', desc: 'Develops coping strategies and organizational skills.' },
            { title: 'Medication Management', desc: 'Stimulant and non-stimulant options to improve focus.' },
            { title: 'Executive Function Coaching', desc: 'Builds planning, time management, and prioritization skills.' },
            { title: 'Environmental Modifications', desc: 'Creating low-distraction workspaces and using timers.' },
        ],
    },
    autism: {
        title: 'Autism Spectrum Disorder',
        fullTitle: 'Autism Spectrum Disorder (ASD)',
        description: 'Autism Spectrum Disorder is a complex developmental condition involving persistent challenges in social interaction, speech and nonverbal communication, and restricted/repetitive behaviors.',
        traits: ['Difficulty with social communication', 'Sensory sensitivities (lights, sounds, textures)', 'Highly focused interests', 'Repetitive movements or behaviors', 'Need for routine and predictability', 'Challenges understanding social cues', 'Direct communication style', 'Strong visual thinking abilities'],
        treatments: [
            { title: 'Occupational Therapy', desc: 'Helps with daily living skills, sensory integration, and motor skills.' },
            { title: 'Speech Therapy', desc: 'Assists with communication challenges, both spoken and non-verbal.' },
            { title: 'Cognitive Behavioral Therapy', desc: 'Useful for managing anxiety, depression, or emotional regulation.' },
            { title: 'Environmental Accommodations', desc: 'Creating sensory-friendly spaces, visual schedules, and routines.' },
        ],
    },
    dyslexia: {
        title: 'Dyslexia',
        fullTitle: 'Dyslexia',
        description: 'Dyslexia is a learning difference that primarily affects the skills involved in accurate and fluent word reading and spelling. It is characterized by difficulties with phonological awareness and decoding.',
        traits: ['Difficulty reading fluently', 'Spelling challenges', 'Mixing up letters or words', 'Slow reading speed', 'Strong verbal abilities', 'Creative problem-solving', 'Visual-spatial strengths', 'Difficulty with sequences'],
        treatments: [
            { title: 'Structured Literacy Programs', desc: 'Systematic phonics instruction with multisensory methods.' },
            { title: 'Assistive Technology', desc: 'Text-to-speech, audiobooks, and speech-to-text tools.' },
            { title: 'Reading Specialists', desc: 'One-on-one support for developing reading strategies.' },
            { title: 'Accommodations', desc: 'Extra time, colored overlays, and alternative assessment formats.' },
        ],
    },
};

export default function ConditionDetails() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState('overview');

    const condition = CONDITIONS_DATA[id] || CONDITIONS_DATA.autism;

    return (
        <div className="container dashboard-container animate-fade-in">
            <div className="flex align-center gap-4 mb-6">
                <button onClick={() => navigate(-1)} className="icon-btn glass-card" style={{ background: 'var(--color-bg-primary)', padding: '10px', borderRadius: '50px', border: 'none', cursor: 'pointer' }}>
                    <ArrowLeft size={20} />
                </button>
                <div style={{ flex: 1 }}>
                    <div className="pill-badge mb-2" style={{ display: 'inline-block', fontSize: '0.8rem' }}>Condition Guide</div>
                    <h1 style={{ fontSize: '2.5rem', margin: 0, color: 'var(--color-primary)' }}>{condition.fullTitle}</h1>
                </div>
            </div>

            <div className="glass-card mb-6" style={{ padding: '2rem' }}>
                <p style={{ fontSize: '1.1rem', lineHeight: '1.6', margin: 0, color: 'var(--color-text-secondary)' }}>{condition.description}</p>
            </div>

            <div className="tabs-container mb-6">
                <div className="tabs">
                    <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
                        <BookOpen size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} /> Overview
                    </button>
                    <button className={`tab-btn ${activeTab === 'treatments' ? 'active' : ''}`} onClick={() => setActiveTab('treatments')}>
                        <HeartPulse size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} /> Support & Treatments
                    </button>
                </div>
            </div>

            <div className="condition-content">
                {activeTab === 'overview' && (
                    <div className="animate-fade-in">
                        <h2 className="mb-4">Common Symptoms & Traits</h2>
                        <div className="symptoms-grid">
                            {condition.traits.map(trait => (
                                <div key={trait} className="tip-item glass-card" style={{ padding: '12px' }}>
                                    <CheckCircle2 size={20} color="var(--color-primary)" />
                                    <span>{trait}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'treatments' && (
                    <div className="animate-fade-in">
                        <h2 className="mb-4">Support Strategies</h2>
                        <div className="grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            {condition.treatments.map((t, i) => (
                                <div key={i} className="glass-card" style={{ padding: '1.5rem' }}>
                                    <h3>{t.title}</h3>
                                    <p className="subtitle">{t.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
