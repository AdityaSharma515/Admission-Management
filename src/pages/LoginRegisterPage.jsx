import React, { useState } from 'react';
import { useAuth } from '../hooks/useContext';
import { FormGroup, Button, Alert, Card } from '../components/FormComponents';

export const LoginRegisterPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const result = login(email, password);
        if (!result.success) {
          setError(result.error);
        }
      } else {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        const result = register(email, password, confirmPassword);
        if (!result.success) {
          setError(result.error);
        }
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-blue-800 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🎓</div>
          <h1 className="text-3xl font-bold text-primary">IIIT Dharwad</h1>
          <p className="text-gray-600 mt-2">Admission Portal</p>
        </div>

        {error && (
          <Alert type="error" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <h2 className="text-2xl font-bold text-primary mb-6 text-center">
            {isLogin ? 'Login' : 'Create Account'}
          </h2>

          <FormGroup
            label="Email Address"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />

          <FormGroup
            label="Password"
            name="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />

          {!isLogin && (
            <FormGroup
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
            />
          )}

          <Button
            variant="primary"
            className="w-full mb-4"
            disabled={loading}
            type="submit"
          >
            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Register'}
          </Button>
        </form>

        <div className="text-center text-gray-600 text-sm">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setEmail('');
              setPassword('');
              setConfirmPassword('');
            }}
            className="text-primary font-semibold hover:underline"
          >
            {isLogin ? 'Register here' : 'Login here'}
          </button>
        </div>
      </Card>
    </div>
  );
};
