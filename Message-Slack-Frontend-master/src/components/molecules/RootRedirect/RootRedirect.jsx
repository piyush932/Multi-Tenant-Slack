import { Navigate } from 'react-router-dom';
import { Landing } from '@/pages/Landing/Landing';

export const RootRedirect = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  if (token && user) {
    return <Navigate to="/home" replace />;
  }
  return <Landing />;
};
