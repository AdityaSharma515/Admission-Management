import React, { useState } from 'react';
import { useAuth } from '../hooks/useContext';
import { FormGroup, Button, Alert, Card } from '../components/FormComponents';

export const LoginRegisterPage = ({ defaultMode = 'login', defaultRole = 'STUDENT' }) => {
  const [isLogin, setIsLogin] = useState(defaultMode !== 'register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState(defaultRole);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const result = await login(email, password);
        if (!result.success) {
          setError(result.error);
        }
      } else {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        const result = await register(email, password, confirmPassword, role);
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
            <>
              <FormGroup label="Account Role" name="role" required>
                <select
                  id="role"
                  name="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                >
                  <option value="STUDENT">Student</option>
                  <option value="VERIFIER">Verifier</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </FormGroup>

              <FormGroup
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
              />
            </>
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
