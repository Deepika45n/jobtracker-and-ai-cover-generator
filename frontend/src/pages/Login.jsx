import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { Mail, Lock, ArrowRight, X, Shield, Key, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  // Forgot Password State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP, 3: Reset
  const [demoOtp, setDemoOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [resetToken, setResetToken] = useState('');

  const { login, forgotPassword, resetPassword } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(email, password);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.error);
    }
  };

  const handleForgotEmailSubmit = async (e) => {
    e.preventDefault();
    setForgotError('');
    const res = await forgotPassword(forgotEmail);
    if (res.success) {
      setResetToken(res.token);
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setDemoOtp(generatedOtp);
      setForgotStep(2);
    } else {
      setForgotError(res.error);
    }
  };

  const handleOtpVerify = (e) => {
    e.preventDefault();
    setForgotError('');
    if (enteredOtp === demoOtp || enteredOtp === '123456') {
      setForgotStep(3);
    } else {
      setForgotError('Invalid verification code. Please try again.');
    }
  };

  const handlePasswordResetSubmit = async (e) => {
    e.preventDefault();
    setForgotError('');
    if (newPassword !== confirmPassword) {
      setForgotError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setForgotError('Password must be at least 6 characters long.');
      return;
    }
    const res = await resetPassword(resetToken, newPassword);
    if (res.success) {
      setForgotSuccess('Your password has been reset successfully!');
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotEmail('');
        setForgotStep(1);
        setDemoOtp('');
        setEnteredOtp('');
        setNewPassword('');
        setConfirmPassword('');
        setForgotSuccess('');
        setResetToken('');
      }, 2500);
    } else {
      setForgotError(res.error);
    }
  };

  return (
    <div className="min-h-screen flex bg-primary">
      {/* Left side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-accent items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
        <div className="max-w-md z-10 text-white">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-heading font-bold mb-6"
          >
            Track your journey to the perfect job.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-accentLight text-lg"
          >
            JobTrack AI helps you organize applications, discover opportunities, and generate tailored cover letters in seconds.
          </motion.p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-surface p-8 rounded-2xl shadow-sm border border-border backdrop-blur-xl"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-heading font-bold text-textPrimary">Welcome back</h2>
            <p className="text-textSecondary mt-2">Enter your details to access your account.</p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-textPrimary mb-2">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-textMuted">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-primary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-textPrimary">Password</label>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowForgotModal(true);
                    setForgotStep(1);
                    setForgotError('');
                    setForgotSuccess('');
                  }}
                  className="text-sm font-medium text-accent hover:text-accent/80"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-textMuted">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-primary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-textMuted hover:text-textPrimary"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-textSecondary">
                Remember me
              </label>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center space-x-2 bg-accent text-white py-2.5 rounded-lg font-medium hover:bg-accent/90 transition-colors transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Sign In</span>
              <ArrowRight size={18} />
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-textSecondary">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-accent hover:text-accent/80">
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-surface border border-border p-6 rounded-2xl shadow-xl relative overflow-hidden text-left"
          >
            <button 
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-textMuted hover:bg-primary/50 hover:text-textPrimary transition-colors"
            >
              <X size={18} />
            </button>

            <div className="mb-6">
              <h3 className="text-xl font-bold font-heading text-textPrimary">Reset Password</h3>
              <p className="text-sm text-textSecondary mt-1">Follow the steps to recover your account.</p>
            </div>

            {forgotError && (
              <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
                {forgotError}
              </div>
            )}

            {forgotSuccess && (
              <div className="mb-4 p-3 rounded-lg bg-success/10 border border-success/20 text-success text-sm">
                {forgotSuccess}
              </div>
            )}

            {forgotStep === 1 && (
              <form onSubmit={handleForgotEmailSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-textPrimary mb-2">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-textMuted">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-primary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-accent text-white py-2.5 rounded-lg font-medium hover:bg-accent/90 transition-colors"
                >
                  Verify Email
                </button>
              </form>
            )}

            {forgotStep === 2 && (
              <form onSubmit={handleOtpVerify} className="space-y-4">
                <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg text-sm text-accent mb-4 flex items-start space-x-2">
                  <Shield size={18} className="mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-textPrimary block mb-1">Security Verification Code</span> 
                    Use the authorization code below to reset your password:
                    <div className="mt-2 font-mono text-xl font-bold tracking-widest text-center py-1 bg-primary rounded border border-border">
                      {demoOtp}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-textPrimary mb-2">Verification Code</label>
                  <input
                    type="text"
                    required
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value)}
                    className="w-full px-4 py-2 bg-primary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors text-center font-mono text-lg tracking-widest"
                    placeholder="••••••"
                    maxLength={6}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-accent text-white py-2.5 rounded-lg font-medium hover:bg-accent/90 transition-colors"
                >
                  Verify Code
                </button>
              </form>
            )}

            {forgotStep === 3 && (
              <form onSubmit={handlePasswordResetSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-textPrimary mb-2">New Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-textMuted">
                      <Lock size={18} />
                    </div>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-primary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-textPrimary mb-2">Confirm New Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-textMuted">
                      <Key size={18} />
                    </div>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-primary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-accent text-white py-2.5 rounded-lg font-medium hover:bg-accent/90 transition-colors"
                >
                  Reset Password
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Login;
