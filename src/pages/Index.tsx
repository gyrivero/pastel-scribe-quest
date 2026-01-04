import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Game from './Game';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background gradient-hero">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-fantasy-sage flex items-center justify-center shadow-glow mx-auto animate-pulse">
            <span className="text-2xl">🎲</span>
          </div>
          <p className="mt-4 text-muted-foreground font-fantasy">Preparando la aventura...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <Game />;
};

export default Index;
