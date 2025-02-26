"use client"
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AdminUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    username: string;
    userType: string;
    userStatus: string;
    permissions: string[];
}

interface AdminContextType {
    user: AdminUser | null;
    loading: boolean;
    fetchUser: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType>({
    user: null,
    loading: true,
    fetchUser: async () => {},
});

export function AdminProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AdminUser | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchUser = async () => {
        try {
            const response = await fetch('/api/admin-auth/user');
            const data = await response.json();

            if (data.success) {
                setUser(data.user);
            } else {
                setUser(null);
                router.push('/admin-login');
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            setUser(null);
            router.push('/admin-login');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <AdminContext.Provider value={{ user, loading, fetchUser }}>
            {children}
        </AdminContext.Provider>
    );
}

export const useAdmin = () => useContext(AdminContext); 