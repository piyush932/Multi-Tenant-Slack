import { Navigate } from 'react-router-dom';

export const RootRedirect = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  if (token && user) {
    return <Navigate to="/home" replace />;
  }
  return <Navigate to="/auth/signin" replace />;
};
