import React from 'react'
import { useState } from 'react';
import {toast} from 'react-hot-toast';
import { useAuthContext } from '../context/AuthContext';

const useSignup = () => {
    const [loading,setLoading] = useState(false);
    const {setAuthUser} = useAuthContext();

    const signup = async ({fullName,username,password,confirmPassword,gender}) => {
        const  success = handleInputErrors({fullName,username,password,confirmPassword,gender})
        if(!success) return false;

        setLoading(true);
        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({fullName,username,password,confirmPassword,gender})
            })

            const data = await res.json();
            if(data.error){
                throw new Error(data.error)
            }
        // localstorage
            localStorage.setItem("chat-user",JSON.stringify(data));

        // context
            setAuthUser(data)

            return true;
        } catch (error) {
            toast.error(error.message)
            return false;
        }finally{
            setLoading(false);
        }
    }

    return {loading ,signup}
}
export default useSignup;


function handleInputErrors({fullName,username,password,confirmPassword,gender}){

    if(!fullName||!username||!password||!confirmPassword||!gender){
       toast.error('Please fill all the fields')
       return false 
    }

    if(password !== confirmPassword){
        toast('Passwords does not match', {
        icon: '❌',});
        return false 
    }

    if(password.length < 6){
        toast.error('Password length is too short :(')
        return false   
    }
    if(username.length < 3){
        toast.error('Username is too short :(')
        return false   
    }

return true;
}