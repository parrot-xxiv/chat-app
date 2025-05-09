'use client';

import { useRouter } from 'next/navigation';
import pb from '@/lib/pocketbase';
import { Button } from './ui/button';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
    const router = useRouter();

    const handleLogout = async () => {
        pb.authStore.clear();
        document.cookie = 'pb_auth=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax';
        router.push('/');
    };

    //   return <button onClick={handleLogout}>Logout</button>;
    return <Button variant="outline" className="w-full" onClick={handleLogout}>
        <LogOut className="w-4 h-4 mr-2" />
        Logout
    </Button>
}
