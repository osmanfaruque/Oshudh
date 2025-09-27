import { createContext, useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import auth from "../configs/firebase.config.js";
import LoadingAnimation from "../components/shared/LoadingAnimation.jsx";

const AuthContextInstance = createContext(null);

export const useAuth = () => useContext(AuthContextInstance);

const AuthContext = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const googleProvider = new GoogleAuthProvider();

  // Create user with email/password
  const createUser = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  // Sign in with email/password
  const signIn = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Sign in with Google
  const signInWithGoogle = () => {
    return signInWithPopup(auth, googleProvider);
  };

  // Log out
  const logout = () => {
    // Clear all cached user roles
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("userRole_")) {
        localStorage.removeItem(key);
      }
    });

    return signOut(auth);
  };

  // Update user profile
  const updateUserProfile = (name, photoURL) => {
    return updateProfile(auth.currentUser, {
      displayName: name,
      photoURL: photoURL,
    });
  };

  // Password Reset
  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  // Observer for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const value = {
    currentUser,
    loading,
    setLoading,
    createUser,
    signIn,
    signInWithGoogle,
    logout,
    updateUserProfile,
    resetPassword,
  };

  return (
    <AuthContextInstance.Provider value={value}>
      {loading ? <LoadingAnimation /> : children}
    </AuthContextInstance.Provider>
  );
};

export default AuthContext;
