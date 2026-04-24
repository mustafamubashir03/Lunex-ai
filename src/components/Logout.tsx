"use client"
import { authClient } from '@/lib/auth-client';
import { redirect } from 'next/navigation';
import { Button } from './ui/button';

const Logout = () => {
    
    const logout = async()=>{
        await authClient.signOut({
            fetchOptions: {
              onSuccess: () => {
                redirect("/login");
              },
            },
          });
    }
  return (
      <Button onClick={logout}>Log out</Button>
  )
}

export default Logout