import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Mail, Lock, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Label, Card } from '../components/ui/core';

import { Logo } from '../components/Logo';
import { toast } from 'sonner';

export function AdminLogin() {
  const [email, setEmail] = useState('admin@glh.local');
  const [password, setPassword] = useState('admin1234');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await adminLogin(email, password);
      if (success) {
        toast.success('Welcome to the dashboard');
        navigate('/dashboard');
      } else {
        toast.error('Invalid admin credentials');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4" style={{ backgroundColor: '#FAFAF5' }}>
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo size="lg" showText={true} showTagline={true} />
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4" style={{ backgroundColor: '#2E7D32' }}>
            <Shield className="h-5 w-5 text-white" />
            <span className="text-white font-medium">Admin Access</span>
          </div>
          <p style={{ color: '#6B6B6B' }}>
            Sign in to access the owner dashboard
          </p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Admin Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: '#6B6B6B' }} />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@glh.local"
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
                  placeholder="Enter admin password"
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
              {isSubmitting ? 'Signing in...' : 'Sign In to Dashboard'}
            </Button>

            <div className="p-3 rounded-lg" style={{ backgroundColor: '#A5D6A7', color: '#2E2E2E' }}>
              <p className="text-sm text-center">
                <strong>Demo admin:</strong> admin@glh.local / admin1234
              </p>
            </div>
          </form>
        </Card>

        <div className="text-center mt-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 transition-colors hover:underline"
            style={{ color: '#6B6B6B' }}
          >
            ← Back to Website
          </Link>
        </div>
      </div>
    </div>
  );
}
