import { useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  GithubAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  User,
  AuthError
} from 'firebase/auth';
import { auth } from '../lib/firebase';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface SignInWithEmailParams {
  email: string;
  password: string;
  isRegistering?: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setState(prev => ({ ...prev, user, loading: false }));
    });

    return () => unsubscribe();
  }, []);

  const handleAuthError = (error: unknown) => {
    const authError = error as AuthError;
    let errorMessage = 'Une erreur est survenue';

    switch (authError.code) {
      case 'auth/user-not-found':
        errorMessage = 'Utilisateur non trouvé';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Mot de passe incorrect';
        break;
      case 'auth/email-already-in-use':
        errorMessage = 'Cet email est déjà utilisé';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Email invalide';
        break;
      case 'auth/weak-password':
        errorMessage = 'Le mot de passe est trop faible';
        break;
      case 'auth/popup-closed-by-user':
        errorMessage = 'Fenêtre de connexion fermée';
        break;
      case 'auth/account-exists-with-different-credential':
        errorMessage = 'Un compte existe déjà avec une autre méthode de connexion';
        break;
    }

    setState(prev => ({ ...prev, error: errorMessage }));
    throw new Error(errorMessage);
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  const signInWithGoogle = async () => {
    try {
      clearError();
      setState(prev => ({ ...prev, loading: true }));
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      handleAuthError(error);
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const signInWithGitHub = async () => {
    try {
      clearError();
      setState(prev => ({ ...prev, loading: true }));
      const provider = new GithubAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      handleAuthError(error);
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const signInWithEmail = async ({ email, password, isRegistering = false }: SignInWithEmailParams) => {
    try {
      clearError();
      setState(prev => ({ ...prev, loading: true }));
      
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      handleAuthError(error);
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const signOut = async () => {
    try {
      clearError();
      setState(prev => ({ ...prev, loading: true }));
      await firebaseSignOut(auth);
    } catch (error) {
      handleAuthError(error);
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    auth,
    signInWithGoogle,
    signInWithGitHub,
    signInWithEmail,
    signOut,
    clearError
  };
}