import { createMemorySessionStorage } from "react-router";
import client from "../services/api"
import { create } from "zustand";

const AuthService = create((set) =>({
    authUser : null,
    isSigningUp : false,
    isLoggingIn : false,
    isUpdatingProfile : false,

    isCheckingAuth : true,

    checkAuth : async () =>{
        try {
            const res = await client.get('/auth/check/',{withCredentials:true});
            set({authUser:res?.data});
            
        } catch (error) {
            set({authUser:null})
            console.log('Error ',error?.message)
        } finally{
            set({isCheckingAuth:false})
        }
    },

    //SIGN UP
    signUpUser: async (userData) => {
        set({ isSigningUp: true });
        try {
            const res = await client.post('/auth/signup/', userData);
            set({ authUser: res?.data });
    
            return {
                success: res?.status === 200,
                data: res?.data,
                message: res?.data?.message,
            };
        } catch (error) {
            const msg = error?.response?.data?.message || error?.message || "Signup Error";
            return {
                success: false,
                message: msg
            };
        } finally {
            set({ isSigningUp: false });
        }
    },
    
    //LOGIN
    logInUser : async (userData) =>{
        set({isLoggingIn:true});
        try {
            const response = await client.post('/auth/login/', userData);
            return {
                success: response?.status === 200,
                message: response?.data?.message,
                data: response?.data
            };
        } catch (error) {
            const msg = error?.response?.data?.message || error?.message || "An unexpected error occurred.";
            return {
                success: false,
                message: msg
            };
        } finally{
            set({isLoggingIn : false})
        }
    },

    //LOGOUT
    logOutUser: async () => {
        try {
            const response = await client.post('/auth/logout');
            return {
                status: response?.status === 200,
                message: response?.data?.message,
            };
        } catch (error) {
            console.log(error?.response?.data?.message || error.message);
            return {
                status: 500,
                message: error?.response?.data?.message || "Logout failed!",
            };
        } finally {
            set({ authUser: null });
        }
    },
}))

export default AuthService ;