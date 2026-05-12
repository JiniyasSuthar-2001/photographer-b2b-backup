import React, { useState, useEffect } from 'react';
import { X, Briefcase, Calendar, CheckCircle2, Clock, Send } from 'lucide-react';
import apiClient from '../../services/api';
import './JobSelectionModal.css';

const JobSelectionModal = ({ isOpen, onClose, photographer, onSelect }) => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedJobId, setSelectedJobId] = useState(null);
    const [sending, setSending] = useState(false);
    const [role, setRole] = useState(photographer?.category || 'Lead');
    const [budget, setBudget] = useState(5000);

    useEffect(() => {
        if (isOpen && photographer) {
            fetchEligibleJobs();
        }
    }, [isOpen, photographer]);

    const fetchEligibleJobs = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get(`/requests/eligible-jobs/${photographer.id}`);
            setJobs(response.data);
        } catch (err) {
            console.error("Error fetching jobs:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSendRequest = async () => {
        if (!selectedJobId) return;
        setSending(true);
        try {
            await apiClient.post('/requests/', {
                job_id: selectedJobId,
                receiver_id: photographer.id,
                role: role,
                budget: budget
            });
            onSelect(); // Success callback
            onClose();
        } catch (err) {
            console.error("Error sending request:", err);
        } finally {
            setSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="job-selection-modal">
                <div className="modal-header">
                    <div className="header-info">
                        <h3>Send Project Request</h3>

                        <p>Inviting <strong>{photographer.full_name || photographer.name}</strong> ({photographer.category || (photographer.specialties && photographer.specialties[0]) || 'General'})</p>
                    </div>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="modal-content">
                    {loading ? (
                        <div className="loading-state">
                            <Clock className="animate-spin" />
                            <p>Finding matching jobs...</p>
                        </div>
                    ) : jobs.length === 0 ? (
                        <div className="empty-state">
                            <p>No open projects found requiring <strong>{photographer.category}</strong> role.</p>
                            <small>Try adding a new project in Projects.</small>

                        </div>
                    ) : (
                        <div className="jobs-list-container">
                            <p className="section-label">Select a Project</p>

                            <div className="jobs-list">
                                {jobs.map(job => (
                                    <div 
                                        key={job.id} 
                                        className={`job-item ${selectedJobId === job.id ? 'selected' : ''}`}
                                        onClick={() => setSelectedJobId(job.id)}
                                    >
                                        <div className="job-radio">
                                            <div className="radio-circle">
                                                {selectedJobId === job.id && <div className="radio-inner" />}
                                            </div>
                                        </div>
                                        <div className="job-info">
                                            <span className="job-title">{job.title}</span>
                                            <span className="job-date">
                                                <Calendar size={12} /> {new Date(job.date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="job-badge">{job.category}</div>
                                    </div>
                                ))}
                            </div>

                            {selectedJobId && (
                                <div className="request-options">
                                    <div className="option-field">
                                        <label>Assign Role</label>
                                        <select value={role} onChange={(e) => setRole(e.target.value)}>
                                            <option value="Lead">Lead Photographer</option>
                                            <option value="Assistant">Assistant Photographer</option>
                                            <option value="Second Shooter">Second Shooter</option>
                                            <option value="Editor">Editor</option>
                                        </select>
                                    </div>
                                    <div className="option-field">
                                        <label>Offer Budget (₹)</label>
                                        <input 
                                            type="number" 
                                            value={budget} 
                                            onChange={(e) => setBudget(e.target.value)} 
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="cancel-btn" onClick={onClose}>Cancel</button>
                    <button 
                        className="send-btn" 
                        disabled={!selectedJobId || sending}
                        onClick={handleSendRequest}
                    >
                        {sending ? "Sending..." : (
                            <>
                                <Send size={16} /> Send Request
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JobSelectionModal;
