import { useState } from 'react';

interface Props {
  onSignIn: (email: string, password: string) => Promise<boolean>;
  onSignUp: (email: string, password: string) => Promise<boolean>;
  onGoogleSignIn: () => Promise<boolean>;
  error: string | null;
  clearError: () => void;
}

export default function AuthScreen({ onSignIn, onSignUp, onGoogleSignIn, error, clearError }: Props) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setSuccessMsg('');

    if (isSignUp) {
      const ok = await onSignUp(email, password);
      if (ok) setSuccessMsg('Check your email for verification link! 📧');
    } else {
      await onSignIn(email, password);
    }
    setLoading(false);
  };

  const handleGoogleClick = async () => {
    setLoading(true);
    await onGoogleSignIn();
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5 bg-gradient-hero">
      {/* Decorative blobs */}
      <div className="fixed top-[-20%] left-[-10%] w-[300px] h-[300px] rounded-full bg-purple/20 blur-[80px]" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[250px] h-[250px] rounded-full bg-coral/15 blur-[80px]" />

      <div className="w-full max-w-[380px] animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <span className="text-gradient">Shop</span><span className="text-text">Mate</span>
          </h1>
          <p className="text-text-tertiary text-sm">Your AI-powered shopping buddy ✨</p>
        </div>

        {/* Glass card */}
        <div className="glass-card p-6">
          {/* Google button */}
          <button
            onClick={handleGoogleClick}
            disabled={loading}
            className="w-full py-3.5 glass-strong rounded-xl text-sm font-semibold text-text flex items-center justify-center gap-3 hover:bg-bg-card-hover transition-all active:scale-[0.98] mb-5"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-glass-border" />
            <span className="text-xs text-text-tertiary font-medium">or</span>
            <div className="flex-1 h-px bg-glass-border" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); clearError(); }}
                placeholder="Email address"
                className="w-full px-4 py-3 glass-card text-sm text-text placeholder:text-text-tertiary/50 focus:outline-none focus:border-purple/40 transition-all"
                required
              />
            </div>
            <div>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); clearError(); }}
                placeholder="Password (min 6 characters)"
                className="w-full px-4 py-3 glass-card text-sm text-text placeholder:text-text-tertiary/50 focus:outline-none focus:border-purple/40 transition-all"
                minLength={6}
                required
              />
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 rounded-xl text-xs font-medium text-coral animate-fade-in" style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.2)' }}>
                ⚠️ {error}
              </div>
            )}

            {/* Success */}
            {successMsg && (
              <div className="p-3 rounded-xl text-xs font-medium text-sage animate-fade-in" style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)' }}>
                ✅ {successMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-purple to-coral text-white font-bold text-sm rounded-xl shadow-lg shadow-purple/20 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? '⏳ Please wait...' : isSignUp ? '🚀 Create Account' : '✨ Sign In'}
            </button>
          </form>

          {/* Toggle */}
          <p className="text-center text-xs text-text-tertiary mt-5">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => { setIsSignUp(!isSignUp); clearError(); setSuccessMsg(''); }}
              className="text-purple-light font-semibold hover:underline"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-text-tertiary mt-6">
          By continuing, you agree to ShopMate's Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
}
