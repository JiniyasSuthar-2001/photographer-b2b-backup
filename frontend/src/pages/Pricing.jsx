// ==================================================================================
// PAGE: PRICING & SUBSCRIPTION
// Purpose: Allows users to upgrade to premium tiers (Pro/Enterprise).
// Impact: Changes user.plan and user.is_pro in the global state and database.
// Connectivity: 
// - Sidebar.jsx (Linked via trial banner)
// - auth_service.py (Updated user status)
// ==================================================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Zap, Crown, Shield, ArrowRight, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { subscriptionService, referralService } from '../services/api';
import { Ticket } from 'lucide-react';
import './Pricing.css';


const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 'Free',
    description: 'Perfect for individual photographers starting their journey.',
    features: [
      'Up to 5 Team Members',
      'Basic Job Hub Access',
      'Calendar Scheduling',
      'Basic Analytics',
      'Community Support'
    ],
    icon: <Zap size={24} />,
    color: '#64748b',
    buttonText: 'Current Plan',
    disabled: true
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '₹1,499',
    period: '/month',
    description: 'Scale your studio with unlimited resources and team management.',
    features: [
      'Unlimited Team Members',
      'Advanced Team Locking',
      'Detailed Financial Analytics',
      'Custom Job Roles',
      'Priority Support',
      'No Transaction Fees'
    ],
    icon: <Crown size={24} />,
    color: 'var(--primary-start)',
    buttonText: 'Upgrade to Pro',
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    description: 'Custom solutions for large production houses and agencies.',
    features: [
      'Multi-Studio Management',
      'Dedicated Account Manager',
      'White-label Reports',
      'API Access',
      'Custom Integrations',
      'SLA Guarantees'
    ],
    icon: <Shield size={24} />,
    color: '#1e293b',
    buttonText: 'Contact Sales'
  }
];

export default function Pricing() {
  const { state, dispatch, addToast } = useApp();
  const navigate = useNavigate();
  const { user } = state;
  const [isProcessing, setIsProcessing] = useState(false);
  const [referralCode, setReferralCode] = useState(user.referred_by || '');
  const [isReferralApplied, setIsReferralApplied] = useState(!!user.referred_by || user.first_purchase_completed);

  const handleApplyReferral = async () => {
    if (!referralCode.trim()) return;
    try {
      await referralService.applyCode(referralCode);
      addToast('Referral code applied!', 'success');
      setIsReferralApplied(true);
    } catch (err) {
      addToast(err.response?.data?.detail || 'Invalid referral code', 'error');
    }
  };

  const handleUpgrade = async (plan) => {
    if (plan.id === 'starter') return;
    if (plan.id === 'enterprise') {
      addToast('Redirecting to sales inquiry...', 'info');
      return;
    }

    setIsProcessing(true);
    try {
      // Amount in INR (dummy values from plan price string)
      const amount = plan.price === '₹1,499' ? 1499 : 5000; 

      // API CALL: Connecting to subscription router purchase endpoint
      await subscriptionService.purchase(plan.name, amount);
      
      addToast('Payment successful!', 'success');
      
      // Navigate after a short delay
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      addToast(err.response?.data?.detail || 'Upgrade failed. Please check your connection.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };


  return (
    <div className="pricing-container">
      <div className="pricing-header">
        <div className="pricing-badge">
          <Sparkles size={14} />
          <span>Flexible Plans</span>
        </div>
        <h1>Elevate Your Production Workflow</h1>
        <p>Choose the plan that fits your studio's ambition. Upgrade or downgrade anytime.</p>
      </div>

      {!isReferralApplied && !user.first_purchase_completed && (
        <div className="referral-apply-section card card-padding" style={{maxWidth: '600px', margin: '0 auto 40px', display: 'flex', gap: '15px', alignItems: 'center'}}>
          <Ticket size={24} style={{color: 'var(--accent-blue)'}} />
          <div style={{flex: 1}}>
            <h4 style={{margin: 0}}>Have a Referral Code?</h4>
            <p style={{margin: 0, fontSize: '13px', color: 'var(--text-muted)'}}>Apply it now to give your friend 15 days of Pro!</p>
          </div>
          <div style={{display: 'flex', gap: '10px'}}>
            <input 
              type="text" 
              className="input-field input-sm" 
              placeholder="Enter code" 
              value={referralCode} 
              onChange={e => setReferralCode(e.target.value)}
              style={{width: '120px'}}
            />
            <button className="btn btn-secondary btn-sm" onClick={handleApplyReferral}>Apply</button>
          </div>
        </div>
      )}

      <div className="pricing-grid">
        {PLANS.map((plan) => (
          <div key={plan.id} className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
            {plan.popular && <div className="popular-tag">MOST POPULAR</div>}
            
            <div className="plan-icon" style={{color: plan.color, background: `${plan.color}15`}}>
              {plan.icon}
            </div>
            
            <h3 className="plan-name">{plan.name}</h3>
            <div className="plan-price">
              <span className="amount">{plan.price}</span>
              {plan.period && <span className="period">{plan.period}</span>}
            </div>
            <p className="plan-desc">{plan.description}</p>

            <button 
              className={`btn plan-btn ${plan.popular ? 'btn-primary' : 'btn-outline'}`}
              disabled={plan.disabled || isProcessing}
              onClick={() => handleUpgrade(plan)}
            >
              {isProcessing && plan.id === 'pro' ? 'Processing...' : plan.buttonText}
              {!plan.disabled && <ArrowRight size={16} />}
            </button>

            <div className="features-list">
              <div className="features-label">WHAT'S INCLUDED</div>
              {plan.features.map((feature, i) => (
                <div key={i} className="feature-item">
                  <Check size={14} className="check-icon" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="pricing-footer">
        <h3>Trusted by 500+ Studios in Gujarat</h3>
        <p>Join the ecosystem that's redefining photography management.</p>
      </div>
    </div>
  );
}
