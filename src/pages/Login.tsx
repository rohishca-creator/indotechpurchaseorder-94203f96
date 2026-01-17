import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoginForm from '@/components/auth/LoginForm';

const Login = () => {
  const navigate = useNavigate();
  const { user, isOrgMember, loading } = useAuth();

  useEffect(() => {
    if (!loading && user && isOrgMember) {
      navigate('/', { replace: true });
    }
  }, [user, isOrgMember, loading, navigate]);

  return <LoginForm onSuccess={() => navigate('/', { replace: true })} />;
};

export default Login;
