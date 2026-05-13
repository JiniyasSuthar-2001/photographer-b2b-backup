import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { useApp } from '../context/AppContext';
import { Eye, EyeOff, CheckCircle2, Loader2 } from 'lucide-react';
import '../styles/Auth.css';

const AuthPage = () => {
    const navigate = useNavigate();
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        email: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const { addToast } = useApp();

    const toggleAuth = () => {
        setIsSignUp(!isSignUp);
        setError('');
        setFormData({ 
            username: '', 
            password: '', 
            confirmPassword: '',
            email: ''
        });
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (isLoading) return;

        setError('');
        setIsLoading(true);
        console.log('Auth handleSubmit called. isSignUp:', isSignUp, 'formData:', formData);

        if (isSignUp && formData.password !== formData.confirmPassword) {
            setError("Passwords do not match!");
            setIsLoading(false);
            return;
        }

        try {
            if (isSignUp) {
                // Filter out confirmPassword before sending to backend
                const { confirmPassword, ...signupData } = formData;
                console.log('Attempting signup with:', signupData);
                await authService.signup(signupData);
                
                setIsSuccess(true);
                addToast('Account created successfully! Please sign in.');
                
                // Switch to login after 2 seconds
                setTimeout(() => {
                    setIsSignUp(false);
                    setIsSuccess(false);
                }, 2000);
            } else {
                console.log('Attempting login for:', formData.username);
                await authService.login(formData.username, formData.password);
                navigate('/');
            }
        } catch (err) {
            console.error('Auth error:', err);
            setError(err.response?.data?.detail || 'An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!formData.username) {
            setError("Please enter your username first to reset password.");
            return;
        }
        try {
            const response = await authService.forgotPassword(formData.username);
            alert(response.message);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to process request.');
        }
    };

    return (
        <div className="auth-container">
            <div className={`cont ${isSignUp ? 's--signup' : ''}`}>
                <div className="form sign-in">
                    <h2>Welcome</h2>
                    {error && !isSignUp && <p style={{ color: 'red', textAlign: 'center', fontSize: '14px' }}>{error}</p>}
                    <label>
                        <span>Username</span>
                        <input 
                            type="text" 
                            name="username" 
                            value={formData.username} 
                            onChange={handleChange} 
                            placeholder="Enter your username"
                        />
                    </label>
                    <label className="password-label">
                        <span>Password</span>
                        <div className="password-input-wrapper">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                name="password" 
                                value={formData.password} 
                                onChange={handleChange} 
                                placeholder="Enter your password"
                            />
                            <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </label>
                    <div className="auth-options">
                        <label className="remember-me">
                            <input 
                                type="checkbox" 
                                checked={rememberMe} 
                                onChange={(e) => setRememberMe(e.target.checked)} 
                            />
                            <span>Remember me</span>
                        </label>
                        <p className="forgot-pass" onClick={handleForgotPassword}>Forgot password?</p>
                    </div>
                    <button 
                        type="button" 
                        className={`submit ${isLoading ? 'loading' : ''}`} 
                        onClick={handleSubmit}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Processing...' : 'Sign In'}
                    </button>
                </div>
                
                <div className="sub-cont">
                    <div className="img">
                        <div className="img__text m--up">
                            <h3>Don't have an account? Please Sign up!</h3>
                        </div>
                        <div className="img__text m--in">
                            <h3>If you already have an account, just sign in.</h3>
                        </div>
                        <div className="img__btn" onClick={toggleAuth}>
                            <span className="m--up">Sign Up</span>
                            <span className="m--in">Sign In</span>
                        </div>
                    </div>
                    
                    <div className="form sign-up">
                        <h2>{isSuccess ? 'Success!' : 'Create Account'}</h2>
                        
                        {isSuccess ? (
                            <div className="success-message" style={{textAlign:'center', padding: '40px 20px'}}>
                                <CheckCircle2 size={48} color="#10B981" style={{margin:'0 auto 20px'}} />
                                <p style={{fontSize: '16px', color: 'var(--text-secondary)'}}>Account created! Redirecting to login...</p>
                            </div>
                        ) : (
                            <>
                                {error && isSignUp && <p style={{ color: 'red', textAlign: 'center', fontSize: '14px', marginTop: '10px' }}>{error}</p>}
                                <label>
                                    <span>Username</span>
                                    <input 
                                        type="text" 
                                        name="username" 
                                        value={formData.username} 
                                        onChange={handleChange} 
                                        placeholder="Choose a username"
                                    />
                                </label>
                                <label>
                                    <span>Email</span>
                                    <input 
                                        type="email" 
                                        name="email" 
                                        value={formData.email} 
                                        onChange={handleChange} 
                                        placeholder="Enter your email address"
                                    />
                                </label>
                                <label className="password-label">
                                    <span>Password</span>
                                    <div className="password-input-wrapper">
                                        <input 
                                            type={showPassword ? "text" : "password"} 
                                            name="password" 
                                            value={formData.password} 
                                            onChange={handleChange} 
                                            placeholder="Create a password"
                                        />
                                        <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </label>
                                <label className="password-label">
                                    <span>Confirm Password</span>
                                    <div className="password-input-wrapper">
                                        <input 
                                            type={showPassword ? "text" : "password"} 
                                            name="confirmPassword" 
                                            value={formData.confirmPassword} 
                                            onChange={handleChange} 
                                            placeholder="Confirm your password"
                                        />
                                    </div>
                                </label>

                                <button 
                                    type="button" 
                                    className={`submit ${isLoading ? 'loading' : ''}`} 
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                >
                                    {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Sign Up'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
