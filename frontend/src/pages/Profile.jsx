// ==================================================================================
// PAGE: PROFILE
// Purpose: Management of user identity, business settings, and professional portfolio.
// Connected Pages: 
// - Dashboard.jsx (Displays user welcome name)
// - Sidebar.jsx (Displays user avatar and email)
// - Team.jsx (Photography aliases are based on user registration info)
// Role Logic:
// - Photographers (Owners) manage studio/business settings here.
// - Freelancers manage their skills, equipment, and portfolio for discovery.
// ==================================================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  User, Mail, Briefcase, MapPin, Link, AtSign, Phone,
  Plus, Trash2, Camera, Settings, AlertTriangle, Star, LogOut,
  Ticket, Gift, Calendar as CalendarIcon, Copy
} from 'lucide-react';
import Avatar from '../components/ui/Avatar';
import { ROLE_TYPES } from '../data/mockData';
import { GUJARAT_CITIES } from '../data/gujaratCities';
import { authService, referralService, systemService } from '../services/api';
import Modal from '../components/ui/Modal';
import './Profile.css';


const ALL_SKILLS = ['Wedding','Portrait','Editorial','Street','Documentary','Commercial','Fashion','Event','Product','Architecture'];
const ROLE_KEYS  = Object.keys(ROLE_TYPES);

export default function Profile() {
  const { state, dispatch, addToast } = useApp();
  const navigate = useNavigate();
  const { user, photographerProfile: fp } = state;

  const [name,  setName]  = useState(user.full_name || user.username);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [studio, setStudio] = useState(user.studioName || 'My Studio');
  const [location, setLocation] = useState(user.studioLocation || 'Ahmedabad');

  const [bio,   setBio]   = useState(fp.bio);
  const [skills,     setSkills]     = useState([...fp.skills]);
  const [specialties,setSpecialties]= useState([...fp.specialties]);
  const [yearsExp,   setYearsExp]   = useState(fp.yearsExperience);
  const [insta,      setInsta]      = useState(fp.instagramHandle);
  const [portfolio,  setPortfolio]  = useState(fp.portfolioUrl);

  const [newEquipName, setNewEquipName] = useState('');
  const [newEquipType, setNewEquipType] = useState('Camera');
  const [showReset, setShowReset] = useState(false);
  const [resetConfirmed, setResetConfirmed] = useState(false);
  const [customCat, setCustomCat] = useState('');

  const [referralInfo, setReferralInfo] = useState({ total_referrals: 0, earned_days: 0, history: [] });

  useEffect(() => {
    referralService.getInfo().then(data => setReferralInfo(data)).catch(console.error);
  }, []);

  const handleDismissTrial = () => {
    dispatch({ type: 'DISMISS_TRIAL_MODAL' });
  };

  const handleSaveAll = () => {
    dispatch({ type:'UPDATE_USER', payload:{ full_name: name, email, phone, studioName:studio, studioLocation:location }});
    dispatch({type:'UPDATE_PHOTOGRAPHER_PROFILE', payload:{ bio, skills, specialties, yearsExperience:yearsExp, instagramHandle:insta, portfolioUrl:portfolio }});
    addToast('✅ Profile saved', 'success');
  };

  const toggleSkill = (s) => setSkills(prev=>prev.includes(s)?prev.filter(x=>x!==s):[...prev,s]);
  const toggleSpecialty = (r) => setSpecialties(prev=>prev.includes(r)?prev.filter(x=>x!==r):[...prev,r]);

  const addEquip = () => {
    if (!newEquipName.trim()) return;
    dispatch({type:'ADD_EQUIPMENT', payload:{name:newEquipName,type:newEquipType}});
    setNewEquipName(''); setNewEquipType('Camera');
    addToast('Equipment added','success');
  };

  const removeEquip = (id) => {
    dispatch({type:'REMOVE_EQUIPMENT', payload:id});
    addToast('Equipment removed','info');
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate('/auth');
    addToast('Logged out successfully', 'info');
  };

  const handleResetData = async () => {
    if (!resetConfirmed) return;
    try {
      await systemService.resetDatabase();
      dispatch({ type: 'RESET_ALL' });
      addToast('✅ All data has been reset to default state', 'success');
      setShowReset(false);
      setResetConfirmed(false);
      // Optional: reload to ensure all data is fresh
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      addToast('Failed to reset data', 'error');
    }
  };

  return (
    <>


      <div className="profile-page">
        <div className="profile-grid">
          {/* Left column */}
          <div className="profile-left">
            {/* Identity */}
            <div className="card card-padding">
              <div className="profile-avatar-section">
                <div className="profile-avatar-wrap">
                  <Avatar name={name} size="xl"/>
                </div>
                <div>
                  <div className="profile-display-name">{name}</div>
                  <div className="profile-display-email">{email}</div>
                  <div style={{display:'flex',gap:6,marginTop:6}}>
                    <span className="badge badge-purple">
                      {user.user_type === 'photographer' ? 'Photographer' : 'Freelancer'}
                    </span>
                  </div>
                </div>

              </div>

              <div className="profile-fields">
                <ProfileField label="Display Name" icon={<User size={14}/>} value={name} onChange={setName}/>
                <ProfileField label="Email Address" icon={<Mail size={14}/>} value={email} onChange={setEmail} type="email"/>
                {/* Phone removed as per user request */}
              </div>
            </div>

            {/* Business Settings */}
            <div className="card card-padding">
              <div className="profile-section-title"><Settings size={14}/> Business Settings</div>
              <div className="profile-fields">
                <ProfileField label="Studio/Business Name" icon={<Briefcase size={14}/>} value={studio} onChange={setStudio}/>
                <div className="profile-field">
                  <label className="profile-field-label">
                    <span style={{color:'var(--text-muted)'}}><MapPin size={14}/></span>
                    City
                  </label>
                  <select className="input-field" value={location} onChange={e=>setLocation(e.target.value)}>
                    {GUJARAT_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Referral & Subscription */}
            <div className="card card-padding">
              <div className="profile-section-title"><Gift size={14}/> Referral & Subscription</div>
              
              <div className="referral-box" style={{background: 'var(--bg-secondary)', padding: '15px', borderRadius: 'var(--radius-md)', marginBottom: '15px'}}>
                <label className="profile-field-label" style={{marginBottom: '10px'}}>Your Referral Code</label>
                <div style={{display: 'flex', gap: '10px'}}>
                  <code style={{flex: 1, background: 'var(--card-bg)', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border)', fontSize: '16px', fontWeight: 'bold', textAlign: 'center', letterSpacing: '2px'}}>
                    {user.referral_code || 'GNR8-CODE'}
                  </code>
                  <button className="btn btn-secondary" onClick={() => { 
                    const code = user.referral_code || '';
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                      navigator.clipboard.writeText(code);
                      addToast('Code copied to clipboard!', 'success');
                    } else {
                      // Fallback for non-secure contexts
                      const textArea = document.createElement("textarea");
                      textArea.value = code;
                      document.body.appendChild(textArea);
                      textArea.select();
                      try {
                        document.execCommand('copy');
                        addToast('Code copied (fallback)!', 'success');
                      } catch (err) {
                        addToast('Failed to copy code', 'error');
                      }
                      document.body.removeChild(textArea);
                    }
                  }}>
                    <Copy size={14}/>
                  </button>
                </div>
                <p style={{fontSize: '12px', color: 'var(--text-muted)', marginTop: '10px'}}>
                  Share this code! Every successful referral adds 15 days to your Pro subscription.
                </p>
                <div style={{marginTop: '15px', paddingTop: '15px', borderTop: '1px solid var(--border)'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px'}}>
                    <span>Total Referrals:</span>
                    <span style={{fontWeight: 'bold'}}>{referralInfo.total_referrals}</span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '13px'}}>
                    <span>Earned Days:</span>
                    <span style={{fontWeight: 'bold', color: 'var(--accent-blue)'}}>+{referralInfo.earned_days} Days</span>
                  </div>
                </div>
              </div>

              <div className="subscription-status-box" style={{border: '1px solid var(--border)', padding: '15px', borderRadius: 'var(--radius-md)'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                  <span style={{fontSize: '14px', fontWeight: 600}}>Status: <span className="badge badge-purple">{user.plan}</span></span>
                  <span style={{fontSize: '12px', color: 'var(--text-muted)'}}>
                    {user.subscription_expiry ? `Expires: ${new Date(user.subscription_expiry).toLocaleDateString()}` : 'No active subscription'}
                  </span>
                </div>
                <button className="btn btn-outline btn-sm" style={{width: '100%', justifyContent: 'center'}} onClick={() => navigate('/pricing')}>
                  {user.is_pro ? 'Extend Subscription' : 'Upgrade to Pro'}
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="card card-padding danger-zone">
              <div className="profile-section-title" style={{color:'var(--accent-rose)'}}>
                <AlertTriangle size={14}/> Danger Zone
              </div>
              <p style={{fontSize:13,color:'var(--text-secondary)',margin:'var(--space-2) 0 var(--space-3)'}}>
                Reset all data to default state. This cannot be undone.
              </p>
              <button className="btn btn-danger" onClick={()=>setShowReset(true)}>Reset All Data</button>
            </div>
          </div>

          {/* Right column */}
          <div className="profile-right">
            {/* Skills & Specialties */}
            <div className="card card-padding">
              <div className="profile-section-title"><Star size={14}/> Professional Details</div>

              <div style={{marginBottom:'var(--space-4)'}}>
                <label style={{display:'block',fontSize:12.5,fontWeight:600,color:'var(--text-secondary)',marginBottom:'var(--space-2)'}}>Bio</label>
                <textarea
                  className="input-field"
                  rows={3}
                  value={bio}
                  onChange={e=>setBio(e.target.value)}
                  style={{resize:'vertical',fontFamily:'inherit'}}
                  placeholder="Describe your photography style and experience…"
                />
              </div>

              <div style={{marginBottom:'var(--space-4)'}}>
                <label style={{display:'block',fontSize:12.5,fontWeight:600,color:'var(--text-secondary)',marginBottom:'var(--space-2)'}}>Skills</label>
                <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                  {ALL_SKILLS.map(s=>{
                    const active=skills.includes(s);
                    return (
                      <button key={s} onClick={()=>toggleSkill(s)}
                              style={{padding:'4px 12px',borderRadius:'var(--radius-pill)',border:`1.5px solid ${active?'var(--accent-blue)':'var(--border)'}`,background:active?'rgba(59,130,246,0.1)':'transparent',color:active?'var(--accent-blue)':'var(--text-secondary)',fontSize:12.5,fontWeight:active?600:400,cursor:'pointer',fontFamily:'inherit',transition:'all .15s'}}>
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{marginBottom:'var(--space-4)'}}>
                <label style={{display:'block',fontSize:12.5,fontWeight:600,color:'var(--text-secondary)',marginBottom:'var(--space-2)'}}>Specialized Roles</label>

                <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                  {specialties.map(r=>{
                    const rt=ROLE_TYPES[r] || { color: '#6366F1', bg: 'rgba(99,102,241,0.12)' };
                    return (
                      <button key={r} onClick={()=>toggleSpecialty(r)}
                              style={{display:'inline-flex',alignItems:'center',gap:5,padding:'5px 14px',borderRadius:'var(--radius-pill)',border:`1.5px solid ${rt.color}`,background:rt.bg,color:rt.color,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit',transition:'all .15s'}}>
                        <span style={{width:7,height:7,borderRadius:'50%',background:rt.color}}/>
                        {r}
                      </button>
                    );
                  })}
                  {ROLE_KEYS.filter(rk => !specialties.includes(rk)).map(r=>{
                    const rt=ROLE_TYPES[r];
                    return (
                      <button key={r} onClick={()=>toggleSpecialty(r)}
                              style={{display:'inline-flex',alignItems:'center',gap:5,padding:'5px 14px',borderRadius:'var(--radius-pill)',border:`1.5px solid var(--border)`,background:'transparent',color:'var(--text-secondary)',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit',transition:'all .15s'}}>
                        <span style={{width:7,height:7,borderRadius:'50%',background:rt.color}}/>
                        {r}
                      </button>
                    );
                  })}
                </div>
                <div style={{display:'flex', gap:8, marginTop:10}}>
                  <input className="input-field input-sm" placeholder="Add custom role..." value={customCat} onChange={e=>setCustomCat(e.target.value)} style={{flex:1}} />
                  <button className="btn btn-secondary btn-sm" onClick={() => { if(customCat.trim()) { toggleSpecialty(customCat.trim()); setCustomCat(''); } }}>
                    <Plus size={14}/> Add
                  </button>
                </div>

              </div>

              <div>
                <label style={{display:'block',fontSize:12.5,fontWeight:600,color:'var(--text-secondary)',marginBottom:'var(--space-2)'}}>Years of Experience</label>
                <input type="number" className="input-field" value={yearsExp} onChange={e=>setYearsExp(parseInt(e.target.value)||0)} style={{width:120}}/>
              </div>
            </div>

            {/* Portfolio & Links */}
            <div className="card card-padding">
              <div className="profile-section-title"><Link size={14}/> Portfolio & Links</div>
              <div className="profile-fields">
                <ProfileField label="Instagram Handle" icon={<AtSign size={14}/>} value={insta} onChange={setInsta} placeholder="@yourhandle"/>
                <ProfileField label="Portfolio URL" icon={<Link size={14}/>} value={portfolio} onChange={setPortfolio} placeholder="yoursite.com"/>
              </div>
            </div>

            {/* Equipment */}
            <div className="card card-padding">
              <div className="profile-section-title"><Camera size={14}/> Equipment</div>
              <div className="equipment-list">
                {fp.equipment.map(e=>(
                  <div key={e.id} className="equipment-row">
                    <div className="equipment-info">
                      <div className="equipment-name">{e.name}</div>
                      <span className="badge badge-gray" style={{fontSize:10.5}}>{e.type}</span>
                    </div>
                    <button className="btn-icon-ghost" onClick={()=>removeEquip(e.id)}>
                      <Trash2 size={14} style={{color:'var(--accent-rose)'}}/>
                    </button>
                  </div>
                ))}
              </div>
              <div style={{display:'flex',gap:'var(--space-2)',marginTop:'var(--space-3)',flexWrap:'wrap'}}>
                <input className="input-field input-sm" placeholder="Equipment name" value={newEquipName} onChange={e=>setNewEquipName(e.target.value)} style={{flex:1,minWidth:140}}/>
                <select className="input-field input-sm" value={newEquipType} onChange={e=>setNewEquipType(e.target.value)} style={{width:110}}>
                  {['Camera','Lens','Lighting','Drone','Accessory','Other'].map(t=><option key={t}>{t}</option>)}
                </select>
                <button className="btn btn-secondary btn-sm" onClick={addEquip}><Plus size={13}/> Add</button>
              </div>
            </div>

            <div style={{display:'flex', gap:'var(--space-3)', marginTop:'var(--space-5)'}}>
              <button className="btn btn-primary" style={{flex:2, justifyContent:'center'}} onClick={handleSaveAll}>
                Save Profile
              </button>
              <button className="btn btn-danger" style={{flex:1, justifyContent:'center', background:'var(--accent-rose)', borderColor:'var(--accent-rose)', color: '#fff'}} onClick={handleLogout}>
                <LogOut size={15}/> Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showReset}
        onClose={() => setShowReset(false)}
        title="⚠️ Critical: Reset All Data"
        size="sm"
        footer={(
          <div style={{display: 'flex', gap: '10px', width: '100%'}}>
            <button className="btn btn-secondary" style={{flex: 1}} onClick={() => setShowReset(false)}>Cancel</button>
            <button 
              className="btn btn-danger" 
              style={{flex: 1, opacity: resetConfirmed ? 1 : 0.5}} 
              disabled={!resetConfirmed}
              onClick={handleResetData}
            >
              OK Reset
            </button>
          </div>
        )}
      >
        <div style={{textAlign: 'center', padding: '10px 0'}}>
          <div style={{background: 'rgba(244, 63, 94, 0.1)', color: 'var(--accent-rose)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px'}}>
            <AlertTriangle size={24} />
          </div>
          <h4 style={{marginBottom: '10px', color: 'var(--text-primary)'}}>Are you absolutely sure?</h4>
          <p style={{fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.5'}}>
            This will permanently delete all your projects, team members, and settings, and restore the platform to its default seed state. <strong>This action cannot be undone.</strong>
          </p>
          
          <label style={{display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', textAlign: 'left'}}>
            <input 
              type="checkbox" 
              checked={resetConfirmed} 
              onChange={(e) => setResetConfirmed(e.target.checked)}
              style={{width: '18px', height: '18px'}}
            />
            <span style={{fontSize: '12.5px', fontWeight: 500, color: 'var(--text-primary)'}}>
              I understand that all data will be permanently reset
            </span>
          </label>
        </div>
      </Modal>
    </>
  );
}

function ProfileField({ label, icon, value, onChange, type='text', placeholder='' }) {
  return (
    <div className="profile-field">
      <label className="profile-field-label">
        {icon && <span style={{color:'var(--text-muted)'}}>{icon}</span>}
        {label}
      </label>
      <input type={type} className="input-field" value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/>
    </div>
  );
}
