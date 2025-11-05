import { Navigate } from "react-router";
import AuthService from "./AuthService";
import { useEffect } from "react";
import LoadingSkeleton from '../pages/LoadingSkeleton'

const PrivateRoute = ({ children }) => {
    const authUser = AuthService((state) => state.authUser);
    const checkAuth = AuthService((state) => state.checkAuth);
    const isCheckingAuth = AuthService((state) => state.isCheckingAuth);
  
    useEffect(() => {
      checkAuth();
    }, [checkAuth]);
  
    if (isCheckingAuth) {
      return <LoadingSkeleton />;
    }
  
    return authUser ? children : <Navigate to="/admin/signin" replace />;
  };

const UnauthenticatedRoute = ({ children }) => {
    const authUser = AuthService((state) => state.authUser);
    const checkAuth = AuthService((state) => state.checkAuth);
    const isCheckingAuth = AuthService((state) => state.isCheckingAuth);
  
    useEffect(() => {
      checkAuth();
    }, [checkAuth]);
  
    if (isCheckingAuth) {
      return <LoadingSkeleton />;
    }
  
    return authUser ? <Navigate to="/cases/all-cases" replace /> : children;
  };

const AdminProtectedRoute = ({ children }) => {
    const authUser = AuthService((state) => state.authUser);
    const checkAuth = AuthService((state) => state.checkAuth);
    const isCheckingAuth = AuthService((state) => state.isCheckingAuth);
  
    useEffect(() => {
      checkAuth();
    }, [checkAuth]);
  
    if (isCheckingAuth) {
      return <LoadingSkeleton />;
    }
  
    // Check if user exists and is admin
    return authUser?.userType === 'admin' ? children : <Navigate to="/cases/all-cases" replace />;
  };

export const Routing = { UnauthenticatedRoute, PrivateRoute, AdminProtectedRoute };