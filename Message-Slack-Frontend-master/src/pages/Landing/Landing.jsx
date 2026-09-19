import { useNavigate } from 'react-router-dom';

export const Landing = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#3F0E40',
      color: 'white',
      textAlign: 'center',
      padding: '24px',
    }}>
      <h1 style={{ fontSize: '48px', marginBottom: '8px' }}>Multi-Tenant Slack</h1>
      <p style={{ fontSize: '18px', maxWidth: '480px', marginBottom: '32px', opacity: 0.85 }}>
        One workspace per company, fully isolated. Channels, real-time messaging,
        invites, and billing — built to demonstrate multi-tenant SaaS architecture.
      </p>
      <div style={{ display: 'flex', gap: '16px' }}>
        <button
          onClick={() => navigate('/auth/signup')}
          style={{
            padding: '12px 28px', borderRadius: '6px', border: 'none',
            background: 'white', color: '#3F0E40', fontWeight: 600, cursor: 'pointer',
          }}
        >
          Create an account
        </button>
        <button
          onClick={() => navigate('/auth/signin')}
          style={{
            padding: '12px 28px', borderRadius: '6px', border: '2px solid white',
            background: 'transparent', color: 'white', fontWeight: 600, cursor: 'pointer',
          }}
        >
          Sign in
        </button>
      </div>
    </div>
  );
};
