import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { AuthPageFrame } from '../components/AuthPageFrame';
import { Button, Input, Label } from '../components/ui/core';

export function Login() {
  const [email, setEmail] = useState('sarah@glh.local');
  const [password, setPassword] = useState('demo1234');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await login(email, password);
      if (success) {
        toast.success('Welcome back');
        navigate('/account');
      } else {
        toast.error('Invalid email or password');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthPageFrame subtitle="Sign in to your account" backTo="/shop" backLabel="Back to Shop">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: '#6B6B6B' }} />
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              style={{ borderColor: '#A5D6A7' }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: '#6B6B6B' }} />
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10"
              style={{ borderColor: '#A5D6A7' }}
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isSubmitting}
          style={{ backgroundColor: '#2E7D32' }}
        >
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </Button>

        <div className="p-3 rounded-lg" style={{ backgroundColor: '#A5D6A7', color: '#2E2E2E' }}>
          <p className="text-sm text-center">
            <strong>Demo customer:</strong> sarah@glh.local / demo1234
          </p>
        </div>

        <div className="text-center pt-4 border-t">
          <p style={{ color: '#6B6B6B' }}>
            Admin?{' '}
            <Link
              to="/admin-login"
              className="transition-colors hover:underline"
              style={{ color: '#2E7D32', fontWeight: 500 }}
            >
              Sign in to dashboard
            </Link>
          </p>
        </div>
      </form>
    </AuthPageFrame>
  );
}
