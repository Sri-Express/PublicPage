// src/app/sysadmin/users/[id]/edit/page.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { 
  UserIcon,
  PencilIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
  TruckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '@/app/context/ThemeContext';
import ThemeSwitcher from '@/app/components/ThemeSwitcher';

interface EditUserForm {
  name: string;
  email: string;
  role: 'client' | 'customer_service' | 'route_admin' | 'company_admin' | 'system_admin';
  phone?: string;
  department?: string;
  company?: string;
  permissions: string[];
  isActive: boolean;
}

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const { theme } = useTheme();

  const [formData, setFormData] = useState<EditUserForm | null>(null);
  const [originalData, setOriginalData] = useState<EditUserForm | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Get auth token
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // API call helper
  const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const token = getToken();
    if (!token) {
      router.push('/sysadmin/login');
      return null;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          router.push('/sysadmin/login');
          return null;
        }
        throw new Error(`API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API call error:', error);
      return null;
    }
  }, [router]);

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      
      try {
        const userResponse = await apiCall(`/api/admin/users/${userId}`);
        if (userResponse) {
          const userData: EditUserForm = {
            name: userResponse.name,
            email: userResponse.email,
            role: userResponse.role,
            phone: userResponse.phone || '',
            department: userResponse.department || '',
            company: userResponse.company || '',
            permissions: userResponse.permissions || [],
            isActive: userResponse.isActive
          };
          setFormData(userData);
          setOriginalData(userData);
        }
      } catch (error) {
        console.error('Error loading user:', error);
        setErrors({ submit: 'Failed to load user data' });
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadUserData();
    }
  }, [userId, apiCall]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!formData) return;

    const { name, value, type } = e.target;

    setFormData(prev => prev ? ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }) : null);

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    if (!formData) return;

    setFormData(prev => prev ? ({
      ...prev,
      permissions: checked 
        ? [...prev.permissions, permission]
        : prev.permissions.filter(p => p !== permission)
    }) : null);
  };

  const validateForm = () => {
    if (!formData) return false;

    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Please enter a valid email address';
    if (formData.role === 'company_admin' && !formData.company?.trim()) newErrors.company = 'Company name is required for company administrators';
    if (formData.role === 'customer_service' && !formData.department?.trim()) newErrors.department = 'Department is required for customer service agents';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const hasChanges = () => {
    if (!formData || !originalData) return false;
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !validateForm()) return;
    setSaving(true);
    try {
      const response = await apiCall(`/api/admin/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
      if (response) router.push(`/sysadmin/users/${userId}`);
    } catch (error) {
      console.error('Error updating user:', error);
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to update user' });
    } finally {
      setSaving(false);
    }
  };

  // --- THEME AND STYLE DEFINITIONS ---

  const lightTheme = {
    mainBg: '#fffbeb',
    bgGradient: 'linear-gradient(to bottom right, #fffbeb, #fef3c7, #fde68a)',
    glassPanelBg: 'rgba(255, 255, 255, 0.92)',
    glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)',
    glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.1)',
    textPrimary: '#1f2937',
    textSecondary: '#4B5563',
    textMuted: '#6B7280',
    navBg: 'rgba(255, 255, 255, 0.85)',
    navBorder: '1px solid rgba(251, 191, 36, 0.3)',
    inputBg: '#fefce8',
    inputBorder: '#fde68a',
    inputFocusBorder: '#f59e0b',
    inputErrorBorder: '#ef4444',
    buttonPrimaryBg: '#f59e0b',
    buttonPrimaryText: '#ffffff',
    buttonSecondaryBg: '#d1d5db',
    buttonSecondaryText: '#1f2937',
    errorBg: '#fef2f2',
    errorText: '#991b1b',
    errorBorder: '#ef4444',
  };

  const darkTheme = {
    mainBg: '#0f172a',
    bgGradient: 'linear-gradient(to bottom right, #0f172a, #1e293b, #334155)',
    glassPanelBg: 'rgba(30, 41, 59, 0.8)',
    glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)',
    glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 10px 20px -5px rgba(0, 0, 0, 0.2)',
    textPrimary: '#f1f5f9',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    navBg: 'rgba(30, 41, 59, 0.92)',
    navBorder: '1px solid rgba(251, 191, 36, 0.3)',
    inputBg: '#334155',
    inputBorder: '#475569',
    inputFocusBorder: '#f59e0b',
    inputErrorBorder: '#dc2626',
    buttonPrimaryBg: '#f59e0b',
    buttonPrimaryText: '#ffffff',
    buttonSecondaryBg: '#374151',
    buttonSecondaryText: '#f9fafb',
    errorBg: '#991b1b',
    errorText: '#fecaca',
    errorBorder: '#dc2626',
  };

  const currentThemeStyles = theme === 'dark' ? darkTheme : lightTheme;

  const animationStyles = ` @keyframes road-marking { 0% { transform: translateX(-200%); } 100% { transform: translateX(500%); } } .animate-road-marking { animation: road-marking 10s linear infinite; } @keyframes car-right { 0% { transform: translateX(-100%); } 100% { transform: translateX(100vw); } } .animate-car-right { animation: car-right 15s linear infinite; } @keyframes car-left { 0% { transform: translateX(100vw) scaleX(-1); } 100% { transform: translateX(-200px) scaleX(-1); } } .animate-car-left { animation: car-left 16s linear infinite; } @keyframes light-blink { 0%, 100% { opacity: 1; box-shadow: 0 0 15px #fcd34d; } 50% { opacity: 0.6; box-shadow: 0 0 5px #fcd34d; } } .animate-light-blink { animation: light-blink 1s infinite; } @keyframes fade-in-down { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-down { animation: fade-in-down 0.8s ease-out forwards; } @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; } @keyframes trainMove { from { left: 100%; } to { left: -300px; } } @keyframes slight-bounce { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-1px); } } .animate-slight-bounce { animation: slight-bounce 2s ease-in-out infinite; } @keyframes steam { 0% { opacity: 0.8; transform: translateY(0) scale(1); } 100% { opacity: 0; transform: translateY(-20px) scale(2.5); } } .animate-steam { animation: steam 2s ease-out infinite; } @keyframes wheels { 0% { transform: rotate(0deg); } 100% { transform: rotate(-360deg); } } .animate-wheels { animation: wheels 2s linear infinite; } @keyframes connecting-rod { 0% { transform: translateX(-1px) rotate(0deg); } 50% { transform: translateX(1px) rotate(180deg); } 100% { transform: translateX(-1px) rotate(360deg); } } .animate-connecting-rod { animation: connecting-rod 2s linear infinite; } @keyframes piston-move { 0% { transform: translateX(-2px); } 50% { transform: translateX(2px); } 100% { transform: translateX(-2px); } } .animate-piston { animation: piston-move 2s linear infinite; } .animation-delay-100 { animation-delay: 0.1s; } .animation-delay-200 { animation-delay: 0.2s; } .animation-delay-300 { animation-delay: 0.3s; } .animation-delay-400 { animation-delay: 0.4s; } .animation-delay-500 { animation-delay: 0.5s; } .animation-delay-600 { animation-delay: 0.6s; } .animation-delay-700 { animation-delay: 0.7s; } .animation-delay-800 { animation-delay: 0.8s; } .animation-delay-1000 { animation-delay: 1s; } .animation-delay-1200 { animation-delay: 1.2s; } .animation-delay-1500 { animation-delay: 1.5s; } .animation-delay-2000 { animation-delay: 2s; } .animation-delay-2500 { animation-delay: 2.5s; } .animation-delay-3000 { animation-delay: 3s; } `;

  // --- HELPER FUNCTIONS FOR UI ---

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'client': return <UserIcon width={20} height={20} />;
      case 'customer_service': return <ChatBubbleLeftRightIcon width={20} height={20} />;
      case 'route_admin': return <TruckIcon width={20} height={20} />;
      case 'company_admin': return <BuildingOfficeIcon width={20} height={20} />;
      case 'system_admin': return <ShieldCheckIcon width={20} height={20} />;
      default: return <UserIcon width={20} height={20} />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'client': return '#3b82f6';
      case 'customer_service': return '#10b981';
      case 'route_admin': return '#f59e0b';
      case 'company_admin': return '#8b5cf6';
      case 'system_admin': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'client': return 'Can register, track buses, and book tickets';
      case 'customer_service': return 'Handles customer inquiries and support tickets';
      case 'route_admin': return 'Manages routes, schedules, and confirms departures';
      case 'company_admin': return 'Manages company fleet and private transport';
      case 'system_admin': return 'Full system access and administration';
      default: return '';
    }
  };

  const getAvailablePermissions = () => {
    if (!formData) return [];
    const basePermissions = ['read_users', 'write_users', 'read_routes', 'write_routes', 'read_vehicles', 'write_vehicles', 'read_analytics', 'write_analytics'];
    const rolePermissions = {
      'client': ['read_routes', 'read_vehicles'],
      'customer_service': ['read_users', 'read_routes', 'read_vehicles'],
      'route_admin': ['read_routes', 'write_routes', 'read_vehicles', 'write_vehicles'],
      'company_admin': ['read_users', 'write_users', 'read_vehicles', 'write_vehicles'],
      'system_admin': basePermissions
    };
    return rolePermissions[formData.role as keyof typeof rolePermissions] || [];
  };

  // --- RENDER STATES ---

  if (loading) {
    return (
      <div style={{ backgroundColor: currentThemeStyles.mainBg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: currentThemeStyles.textPrimary }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #f3f4f6', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          <p>Loading user data...</p>
        </div>
        <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!formData) {
    return (
      <div style={{ backgroundColor: currentThemeStyles.mainBg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          backgroundColor: currentThemeStyles.glassPanelBg,
          padding: '3rem',
          borderRadius: '1rem',
          boxShadow: currentThemeStyles.glassPanelShadow,
          backdropFilter: 'blur(12px)',
          border: currentThemeStyles.glassPanelBorder,
          textAlign: 'center',
          color: currentThemeStyles.textPrimary,
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          alignItems: 'center'
        }}>
          <ExclamationTriangleIcon width={48} height={48} color="#ef4444" />
          <div>User not found or failed to load.</div>
          <Link href="/sysadmin/users" style={{ backgroundColor: '#3b82f6', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', textDecoration: 'none' }}>
            Back to Users
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: currentThemeStyles.mainBg, minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <style jsx>{animationStyles}</style>
      
      {/* Animated Background */}
      <div style={{ position: 'absolute', inset: 0, background: currentThemeStyles.bgGradient, zIndex: 0 }}>
        {/* This is the full animated background copied from the dashboard */}
        <div style={{ position: 'absolute', top: '15%', left: 0, right: 0, height: '100px', backgroundColor: '#1f2937', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)', zIndex: 2 }}></div><div style={{ position: 'absolute', top: '15%', left: 0, right: 0, height: '100px', zIndex: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><div style={{ width: '100%', height: '5px', background: 'repeating-linear-gradient(to right, #fcd34d, #fcd34d 30px, transparent 30px, transparent 60px)', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' }}></div></div><div style={{ position: 'absolute', top: '15%', left: 0, right: 0, height: '100px', overflow: 'hidden', zIndex: 3 }}><div style={{ position: 'absolute', top: '25%', left: 0, right: 0, height: '8px', display: 'flex', transform: 'translateY(-50%)' }}><div className="animate-road-marking" style={{ position: 'absolute', width: '80px', backgroundColor: '#fbbf24', left: '10%' }}></div><div className="animate-road-marking animation-delay-200" style={{ position: 'absolute', width: '80px', backgroundColor: '#fbbf24', left: '30%' }}></div><div className="animate-road-marking animation-delay-500" style={{ position: 'absolute', width: '80px', backgroundColor: '#fbbf24', left: '50%' }}></div><div className="animate-road-marking animation-delay-700" style={{ position: 'absolute', width: '80px', backgroundColor: '#fbbf24', left: '70%' }}></div></div><div style={{ position: 'absolute', top: '75%', left: 0, right: 0, height: '8px', display: 'flex', transform: 'translateY(-50%)' }}><div className="animate-road-marking animation-delay-300" style={{ position: 'absolute', width: '80px', backgroundColor: '#fbbf24', left: '20%' }}></div><div className="animate-road-marking animation-delay-400" style={{ position: 'absolute', width: '80px', backgroundColor: '#fbbf24', left: '40%' }}></div><div className="animate-road-marking animation-delay-600" style={{ position: 'absolute', width: '80px', backgroundColor: '#fbbf24', left: '60%' }}></div><div className="animate-road-marking animation-delay-800" style={{ position: 'absolute', width: '80px', backgroundColor: '#fbbf24', left: '80%' }}></div></div></div>
        <div style={{ position: 'absolute', top: '60%', left: 0, right: 0, height: '80px', backgroundColor: '#1f2937', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)', zIndex: 2 }}></div><div style={{ position: 'absolute', top: '60%', left: 0, right: 0, height: '80px', zIndex: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><div style={{ width: '100%', height: '4px', background: 'repeating-linear-gradient(to right, #fcd34d, #fcd34d 20px, transparent 20px, transparent 40px)', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' }}></div></div>
        <div style={{ position: 'absolute', top: '85%', left: 0, right: 0, height: '50px', background: 'linear-gradient(to bottom, #4b5563 0%, #374151 100%)', boxShadow: '0 5px 10px -3px rgba(0, 0, 0, 0.3)', zIndex: 2 }}></div><div style={{ position: 'absolute', top: '85%', left: 0, right: 0, height: '50px', overflow: 'visible', zIndex: 3 }}><div style={{ position: 'absolute', top: '35%', left: 0, right: 0, height: '6px', background: 'linear-gradient(to bottom, #94a3b8 0%, #64748b 100%)', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)', zIndex: 4 }}></div><div style={{ position: 'absolute', top: '65%', left: 0, right: 0, height: '6px', background: 'linear-gradient(to bottom, #94a3b8 0%, #64748b 100%)', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)', zIndex: 4 }}></div><div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%', display: 'flex', gap: '15px', zIndex: 3 }}>{Array(30).fill(0).map((_, i) => (<div key={i} style={{ width: '20px', height: '100%', background: 'linear-gradient(to bottom, #92400e 0%, #7c2d12 70%, #713f12 100%)', marginLeft: `${i * 30}px`, boxShadow: 'inset 0 0 2px rgba(0, 0, 0, 0.5)', border: '1px solid #78350f' }}></div>))}</div></div>
        <div className="animate-slight-bounce" style={{ position: 'absolute', top: '85%', marginTop: '-15px', left: '100%', height: '70px', width: '300px', zIndex: 6, pointerEvents: 'none', display: 'flex', animation: 'trainMove 15s linear infinite', filter: 'drop-shadow(0 4px 3px rgba(0, 0, 0, 0.2))' }}><div style={{ display: 'flex', width: '100%', height: '100%' }}><div style={{ position: 'relative', width: '110px', height: '60px', marginRight: '5px' }}><div style={{ position: 'absolute', bottom: '12px', left: '8px', width: '85%', height: '30px', background: 'linear-gradient(to bottom, #b91c1c 0%, #9f1239 60%, #7f1d1d 100%)', borderRadius: '8px 5px 5px 5px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)', border: '1px solid #7f1d1d' }}></div><div style={{ position: 'absolute', bottom: '42px', right: '10px', width: '60px', height: '30px', background: 'linear-gradient(to bottom, #7f1d1d 0%, #681e1e 100%)', borderRadius: '6px 6px 0 0', border: '1px solid #601414', boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.1)' }}></div><div style={{ position: 'absolute', bottom: '72px', right: '8px', width: '65px', height: '5px', background: '#4c1d95', borderRadius: '2px', boxShadow: '0 -1px 2px rgba(0, 0, 0, 0.3)' }}></div><div style={{ position: 'absolute', bottom: '5px', left: '0', width: '15px', height: '18px', background: 'linear-gradient(135deg, #9f1239 0%, #7f1d1d 100%)', clipPath: 'polygon(0 0, 100% 0, 100% 35%, 50% 100%, 0 35%)', borderRadius: '2px' }}></div><div style={{ position: 'absolute', bottom: '15px', left: '3px', width: '10px', height: '4px', backgroundColor: '#64748b', borderRadius: '1px', border: '1px solid #475569' }}></div><div style={{ position: 'absolute', top: '3px', left: '40px', padding: '3px 5px', backgroundColor: '#fef3c7', borderRadius: '3px', border: '1px solid #7f1d1d', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)', fontSize: '9px', fontWeight: 'bold', color: '#7f1d1d', whiteSpace: 'nowrap', fontFamily: "'Noto Sans Sinhala', 'Iskoola Pota', sans-serif", zIndex: 10, transform: 'rotate(-2deg)' }}>දුම්රිය සේවය</div><div style={{ position: 'absolute', bottom: '42px', left: '22px', width: '14px', height: '18px', background: 'linear-gradient(to bottom, #27272a 0%, #18181b 100%)', borderRadius: '4px 4px 0 0', border: '1px solid #111', boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.1)' }}><div style={{ position: 'absolute', top: '-2px', left: '-2px', width: '16px', height: '4px', background: 'linear-gradient(to bottom, #cbd5e1 0%, #94a3b8 100%)', borderRadius: '4px 4px 0 0', border: '1px solid #64748b' }}></div><div className="animate-steam" style={{ position: 'absolute', top: '-15px', left: '-2px', width: '18px', height: '15px', background: 'radial-gradient(circle, rgba(255, 255, 255, 0.95) 30%, rgba(255, 255, 255, 0.6) 80%)', borderRadius: '50%', opacity: 0.9 }}></div><div className="animate-steam animation-delay-200" style={{ position: 'absolute', top: '-12px', left: '4px', width: '16px', height: '14px', background: 'radial-gradient(circle, rgba(255, 255, 255, 0.95) 30%, rgba(255, 255, 255, 0.6) 80%)', borderRadius: '50%', opacity: 0.85 }}></div><div className="animate-steam animation-delay-400" style={{ position: 'absolute', top: '-18px', left: '2px', width: '20px', height: '18px', background: 'radial-gradient(circle, rgba(255, 255, 255, 0.95) 30%, rgba(255, 255, 255, 0.6) 80%)', borderRadius: '50%', opacity: 0.9 }}></div><div className="animate-steam animation-delay-600" style={{ position: 'absolute', top: '-14px', left: '-4px', width: '17px', height: '15px', background: 'radial-gradient(circle, rgba(255, 255, 255, 0.95) 30%, rgba(255, 255, 255, 0.6) 80%)', borderRadius: '50%', opacity: 0.8 }}></div><div className="animate-steam animation-delay-800" style={{ position: 'absolute', top: '-22px', left: '1px', width: '22px', height: '20px', background: 'radial-gradient(circle, rgba(255, 255, 255, 0.95) 30%, rgba(255, 255, 255, 0.6) 80%)', borderRadius: '50%', opacity: 0.7 }}></div></div><div style={{ position: 'absolute', bottom: '42px', left: '45px', width: '8px', height: '10px', background: 'linear-gradient(to bottom, #fbbf24 0%, #d97706 100%)', borderRadius: '4px 4px 8px 8px', border: '1px solid #b45309' }}></div><div style={{ position: 'absolute', bottom: '42px', left: '60px', width: '6px', height: '8px', background: 'linear-gradient(to bottom, #94a3b8 0%, #64748b 100%)', borderRadius: '3px 3px 0 0', border: '1px solid #475569' }}></div><div className="animate-wheels" style={{ position: 'absolute', bottom: '0', left: '15px', width: '24px', height: '24px', background: 'linear-gradient(135deg, #64748b 0%, #334155 100%)', borderRadius: '50%', border: '3px solid #cbd5e1', boxSizing: 'border-box', boxShadow: '0 3px 6px rgba(0, 0, 0, 0.4)' }}><div style={{ position: 'absolute', top: '1px', left: '1px', right: '1px', bottom: '1px', borderRadius: '50%', border: '2px solid #94a3b8' }}></div><div style={{ position: 'absolute', top: 'calc(50% - 1px)', left: '0', width: '100%', height: '2px', backgroundColor: '#cbd5e1' }}></div><div style={{ position: 'absolute', top: '0', left: 'calc(50% - 1px)', width: '2px', height: '100%', backgroundColor: '#cbd5e1' }}></div><div style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', background: 'conic-gradient(from 0deg, transparent 0deg, transparent 10deg, #cbd5e1 10deg, #cbd5e1 15deg, transparent 15deg, transparent 55deg, #cbd5e1 55deg, #cbd5e1 60deg, transparent 60deg, transparent 100deg, #cbd5e1 100deg, #cbd5e1 105deg, transparent 105deg, transparent 145deg, #cbd5e1 145deg, #cbd5e1 150deg, transparent 150deg, transparent 190deg, #cbd5e1 190deg, #cbd5e1 195deg, transparent 195deg, transparent 235deg, #cbd5e1 235deg, #cbd5e1 240deg, transparent 240deg, transparent 280deg, #cbd5e1 280deg, #cbd5e1 285deg, transparent 285deg, transparent 325deg, #cbd5e1 325deg, #cbd5e1 330deg, transparent 330deg)', borderRadius: '50%' }}></div><div style={{ position: 'absolute', top: 'calc(50% - 4px)', left: 'calc(50% - 4px)', width: '8px', height: '8px', background: 'radial-gradient(circle, #f8fafc 0%, #cbd5e1 100%)', borderRadius: '50%', border: '1px solid #64748b', boxShadow: 'inset 0 0 2px rgba(0, 0, 0, 0.2)' }}></div></div><div className="animate-wheels" style={{ position: 'absolute', bottom: '0', right: '25px', width: '24px', height: '24px', background: 'linear-gradient(135deg, #64748b 0%, #334155 100%)', borderRadius: '50%', border: '3px solid #cbd5e1', boxSizing: 'border-box', boxShadow: '0 3px 6px rgba(0, 0, 0, 0.4)' }}><div style={{ position: 'absolute', top: '1px', left: '1px', right: '1px', bottom: '1px', borderRadius: '50%', border: '2px solid #94a3b8' }}></div><div style={{ position: 'absolute', top: 'calc(50% - 1px)', left: '0', width: '100%', height: '2px', backgroundColor: '#cbd5e1' }}></div><div style={{ position: 'absolute', top: '0', left: 'calc(50% - 1px)', width: '2px', height: '100%', backgroundColor: '#cbd5e1' }}></div><div style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', background: 'conic-gradient(from 0deg, transparent 0deg, transparent 10deg, #cbd5e1 10deg, #cbd5e1 15deg, transparent 15deg, transparent 55deg, #cbd5e1 55deg, #cbd5e1 60deg, transparent 60deg, transparent 100deg, #cbd5e1 100deg, #cbd5e1 105deg, transparent 105deg, transparent 145deg, #cbd5e1 145deg, #cbd5e1 150deg, transparent 150deg, transparent 190deg, #cbd5e1 190deg, #cbd5e1 195deg, transparent 195deg, transparent 235deg, #cbd5e1 235deg, #cbd5e1 240deg, transparent 240deg, transparent 280deg, #cbd5e1 280deg, #cbd5e1 285deg, transparent 285deg, transparent 325deg, #cbd5e1 325deg, #cbd5e1 330deg, transparent 330deg)', borderRadius: '50%' }}></div><div style={{ position: 'absolute', top: 'calc(50% - 4px)', left: 'calc(50% - 4px)', width: '8px', height: '8px', background: 'radial-gradient(circle, #f8fafc 0%, #cbd5e1 100%)', borderRadius: '50%', border: '1px solid #64748b', boxShadow: 'inset 0 0 2px rgba(0, 0, 0, 0.2)' }}></div></div><div className="animate-wheels" style={{ position: 'absolute', bottom: '0', right: '60px', width: '24px', height: '24px', background: 'linear-gradient(135deg, #64748b 0%, #334155 100%)', borderRadius: '50%', border: '3px solid #cbd5e1', boxSizing: 'border-box', boxShadow: '0 3px 6px rgba(0, 0, 0, 0.4)' }}><div style={{ position: 'absolute', top: '1px', left: '1px', right: '1px', bottom: '1px', borderRadius: '50%', border: '2px solid #94a3b8' }}></div><div style={{ position: 'absolute', top: 'calc(50% - 1px)', left: '0', width: '100%', height: '2px', backgroundColor: '#cbd5e1' }}></div><div style={{ position: 'absolute', top: '0', left: 'calc(50% - 1px)', width: '2px', height: '100%', backgroundColor: '#cbd5e1' }}></div><div style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', background: 'conic-gradient(from 0deg, transparent 0deg, transparent 10deg, #cbd5e1 10deg, #cbd5e1 15deg, transparent 15deg, transparent 55deg, #cbd5e1 55deg, #cbd5e1 60deg, transparent 60deg, transparent 100deg, #cbd5e1 100deg, #cbd5e1 105deg, transparent 105deg, transparent 145deg, #cbd5e1 145deg, #cbd5e1 150deg, transparent 150deg, transparent 190deg, #cbd5e1 190deg, #cbd5e1 195deg, transparent 195deg, transparent 235deg, #cbd5e1 235deg, #cbd5e1 240deg, transparent 240deg, transparent 280deg, #cbd5e1 280deg, #cbd5e1 285deg, transparent 285deg, transparent 325deg, #cbd5e1 325deg, #cbd5e1 330deg, transparent 330deg)', borderRadius: '50%' }}></div><div style={{ position: 'absolute', top: 'calc(50% - 4px)', left: 'calc(50% - 4px)', width: '8px', height: '8px', background: 'radial-gradient(circle, #f8fafc 0%, #cbd5e1 100%)', borderRadius: '50%', border: '1px solid #64748b', boxShadow: 'inset 0 0 2px rgba(0, 0, 0, 0.2)' }}></div></div><div style={{ position: 'absolute', bottom: '24px', left: '22px', width: '30px', height: '8px', backgroundColor: '#64748b', borderRadius: '4px', border: '1px solid #475569', zIndex: 3 }}><div className="animate-piston" style={{ position: 'absolute', top: '2px', left: '3px', width: '22px', height: '2px', backgroundColor: '#94a3b8', borderRadius: '1px' }}></div></div><div style={{ position: 'absolute', bottom: '47px', right: '15px', width: '15px', height: '12px', background: 'linear-gradient(135deg, #93c5fd 0%, #bfdbfe 50%, #93c5fd 100%)', borderRadius: '2px', border: '2px solid #7f1d1d', boxShadow: 'inset 0 0 4px rgba(255, 255, 255, 0.5)' }}></div><div style={{ position: 'absolute', bottom: '47px', right: '40px', width: '15px', height: '12px', background: 'linear-gradient(135deg, #93c5fd 0%, #bfdbfe 50%, #93c5fd 100%)', borderRadius: '2px', border: '2px solid #7f1d1d', boxShadow: 'inset 0 0 4px rgba(255, 255, 255, 0.5)' }}></div><div className="animate-light-blink" style={{ position: 'absolute', bottom: '22px', left: '3px', width: '10px', height: '10px', background: 'radial-gradient(circle, #fef3c7 0%, #fcd34d 100%)', borderRadius: '50%', boxShadow: '0 0 15px #fcd34d, 0 0 5px #fef3c7', border: '1px solid #b45309' }}></div></div><div style={{ position: 'relative', width: '90px', height: '40px', marginTop: '15px', marginRight: '5px' }}><div style={{ position: 'absolute', bottom: '5px', width: '100%', height: '28px', background: 'linear-gradient(to bottom, #dc2626 0%, #be123c 60%, #9f1239 100%)', borderRadius: '4px', boxSizing: 'border-box', border: '1px solid #881337', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)' }}><div style={{ position: 'absolute', top: '18px', left: '0', width: '100%', height: '3px', backgroundColor: '#fbbf24', opacity: 0.8 }}></div></div><div style={{ position: 'absolute', bottom: '33px', left: '2px', width: '96%', height: '4px', background: 'linear-gradient(to bottom, #7f1d1d 0%, #881337 100%)', borderRadius: '40% 40% 0 0 / 100% 100% 0 0', boxShadow: '0 -1px 2px rgba(0, 0, 0, 0.3)' }}></div><div style={{ position: 'absolute', top: '5px', left: '10px', width: '15px', height: '10px', background: 'linear-gradient(135deg, #93c5fd 0%, #bfdbfe 50%, #93c5fd 100%)', borderRadius: '2px', border: '1px solid #881337', boxShadow: 'inset 0 0 3px rgba(255, 255, 255, 0.5)' }}></div><div style={{ position: 'absolute', top: '5px', left: '35px', width: '15px', height: '10px', background: 'linear-gradient(135deg, #93c5fd 0%, #bfdbfe 50%, #93c5fd 100%)', borderRadius: '2px', border: '1px solid #881337', boxShadow: 'inset 0 0 3px rgba(255, 255, 255, 0.5)' }}></div><div style={{ position: 'absolute', top: '5px', left: '60px', width: '15px', height: '10px', background: 'linear-gradient(135deg, #93c5fd 0%, #bfdbfe 50%, #93c5fd 100%)', borderRadius: '2px', border: '1px solid #881337', boxShadow: 'inset 0 0 3px rgba(255, 255, 255, 0.5)' }}></div><div className="animate-wheels" style={{ position: 'absolute', bottom: '0', left: '20px', width: '20px', height: '20px', background: 'linear-gradient(135deg, #64748b 0%, #334155 100%)', borderRadius: '50%', border: '3px solid #cbd5e1', boxSizing: 'border-box', boxShadow: '0 3px 6px rgba(0, 0, 0, 0.4)' }}><div style={{ position: 'absolute', top: '1px', left: '1px', right: '1px', bottom: '1px', borderRadius: '50%', border: '2px solid #94a3b8' }}></div><div style={{ position: 'absolute', top: 'calc(50% - 1px)', left: '0', width: '100%', height: '2px', backgroundColor: '#cbd5e1' }}></div><div style={{ position: 'absolute', top: '0', left: 'calc(50% - 1px)', width: '2px', height: '100%', backgroundColor: '#cbd5e1' }}></div><div style={{ position: 'absolute', top: 'calc(50% - 3px)', left: 'calc(50% - 3px)', width: '6px', height: '6px', background: 'radial-gradient(circle, #f8fafc 0%, #cbd5e1 100%)', borderRadius: '50%', border: '1px solid #64748b', boxShadow: 'inset 0 0 2px rgba(0, 0, 0, 0.2)' }}></div></div><div className="animate-wheels" style={{ position: 'absolute', bottom: '0', right: '20px', width: '20px', height: '20px', background: 'linear-gradient(135deg, #64748b 0%, #334155 100%)', borderRadius: '50%', border: '3px solid #cbd5e1', boxSizing: 'border-box', boxShadow: '0 3px 6px rgba(0, 0, 0, 0.4)' }}><div style={{ position: 'absolute', top: '1px', left: '1px', right: '1px', bottom: '1px', borderRadius: '50%', border: '2px solid #94a3b8' }}></div><div style={{ position: 'absolute', top: 'calc(50% - 1px)', left: '0', width: '100%', height: '2px', backgroundColor: '#cbd5e1' }}></div><div style={{ position: 'absolute', top: '0', left: 'calc(50% - 1px)', width: '2px', height: '100%', backgroundColor: '#cbd5e1' }}></div><div style={{ position: 'absolute', top: 'calc(50% - 3px)', left: 'calc(50% - 3px)', width: '6px', height: '6px', background: 'radial-gradient(circle, #f8fafc 0%, #cbd5e1 100%)', borderRadius: '50%', border: '1px solid #64748b', boxShadow: 'inset 0 0 2px rgba(0, 0, 0, 0.2)' }}></div></div></div><div style={{ position: 'relative', width: '90px', height: '40px', marginTop: '15px' }}><div style={{ position: 'absolute', bottom: '5px', width: '100%', height: '28px', background: 'linear-gradient(to bottom, #c026d3 0%, #a21caf 60%, #86198f 100%)', borderRadius: '4px', boxSizing: 'border-box', border: '1px solid #701a75', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)' }}><div style={{ position: 'absolute', top: '18px', left: '0', width: '100%', height: '3px', backgroundColor: '#fbbf24', opacity: 0.8 }}></div></div><div style={{ position: 'absolute', bottom: '33px', left: '2px', width: '96%', height: '4px', background: 'linear-gradient(to bottom, #701a75 0%, #86198f 100%)', borderRadius: '40% 40% 0 0 / 100% 100% 0 0', boxShadow: '0 -1px 2px rgba(0, 0, 0, 0.3)' }}></div><div style={{ position: 'absolute', top: '5px', left: '10px', width: '15px', height: '10px', background: 'linear-gradient(135deg, #93c5fd 0%, #bfdbfe 50%, #93c5fd 100%)', borderRadius: '2px', border: '1px solid #701a75', boxShadow: 'inset 0 0 3px rgba(255, 255, 255, 0.5)' }}></div><div style={{ position: 'absolute', top: '5px', left: '35px', width: '15px', height: '10px', background: 'linear-gradient(135deg, #93c5fd 0%, #bfdbfe 50%, #93c5fd 100%)', borderRadius: '2px', border: '1px solid #701a75', boxShadow: 'inset 0 0 3px rgba(255, 255, 255, 0.5)' }}></div><div style={{ position: 'absolute', top: '5px', left: '60px', width: '15px', height: '10px', background: 'linear-gradient(135deg, #93c5fd 0%, #bfdbfe 50%, #93c5fd 100%)', borderRadius: '2px', border: '1px solid #701a75', boxShadow: 'inset 0 0 3px rgba(255, 255, 255, 0.5)' }}></div><div className="animate-light-blink animation-delay-500" style={{ position: 'absolute', bottom: '15px', right: '3px', width: '6px', height: '6px', background: 'radial-gradient(circle, #fef3c7 0%, #f87171 100%)', borderRadius: '50%', boxShadow: '0 0 8px #f87171', border: '1px solid #7f1d1d' }}></div><div className="animate-wheels" style={{ position: 'absolute', bottom: '0', left: '20px', width: '20px', height: '20px', background: 'linear-gradient(135deg, #64748b 0%, #334155 100%)', borderRadius: '50%', border: '3px solid #cbd5e1', boxSizing: 'border-box', boxShadow: '0 3px 6px rgba(0, 0, 0, 0.4)' }}><div style={{ position: 'absolute', top: '1px', left: '1px', right: '1px', bottom: '1px', borderRadius: '50%', border: '2px solid #94a3b8' }}></div><div style={{ position: 'absolute', top: 'calc(50% - 1px)', left: '0', width: '100%', height: '2px', backgroundColor: '#cbd5e1' }}></div><div style={{ position: 'absolute', top: '0', left: 'calc(50% - 1px)', width: '2px', height: '100%', backgroundColor: '#cbd5e1' }}></div><div style={{ position: 'absolute', top: 'calc(50% - 3px)', left: 'calc(50% - 3px)', width: '6px', height: '6px', background: 'radial-gradient(circle, #f8fafc 0%, #cbd5e1 100%)', borderRadius: '50%', border: '1px solid #64748b', boxShadow: 'inset 0 0 2px rgba(0, 0, 0, 0.2)' }}></div></div><div className="animate-wheels" style={{ position: 'absolute', bottom: '0', right: '20px', width: '20px', height: '20px', background: 'linear-gradient(135deg, #64748b 0%, #334155 100%)', borderRadius: '50%', border: '3px solid #cbd5e1', boxSizing: 'border-box', boxShadow: '0 3px 6px rgba(0, 0, 0, 0.4)' }}><div style={{ position: 'absolute', top: '1px', left: '1px', right: '1px', bottom: '1px', borderRadius: '50%', border: '2px solid #94a3b8' }}></div><div style={{ position: 'absolute', top: 'calc(50% - 1px)', left: '0', width: '100%', height: '2px', backgroundColor: '#cbd5e1' }}></div><div style={{ position: 'absolute', top: '0', left: 'calc(50% - 1px)', width: '2px', height: '100%', backgroundColor: '#cbd5e1' }}></div><div style={{ position: 'absolute', top: 'calc(50% - 3px)', left: 'calc(50% - 3px)', width: '6px', height: '6px', background: 'radial-gradient(circle, #f8fafc 0%, #cbd5e1 100%)', borderRadius: '50%', border: '1px solid #64748b', boxShadow: 'inset 0 0 2px rgba(0, 0, 0, 0.2)' }}></div></div><div style={{ position: 'absolute', bottom: '15px', left: '-8px', width: '10px', height: '4px', backgroundColor: '#64748b', borderRadius: '1px', zIndex: 1 }}></div></div></div></div>
        <div className="animate-car-left animation-delay-1000" style={{ position: 'absolute', top: '15%', marginTop: '10px', right: '-150px', width: '150px', height: '70px', zIndex: 5, filter: 'drop-shadow(0 4px 3px rgba(0, 0, 0, 0.3))' }}><div style={{ position: 'relative', width: '100%', height: '100%' }}><div style={{ position: 'absolute', bottom: 0, right: 0, width: '50px', height: '45px', background: 'linear-gradient(to bottom, #059669 0%, #047857 70%, #065f46 100%)', borderRadius: '3px 8px 3px 3px', border: '1px solid #064e3b', boxShadow: 'inset 0 -3px 8px rgba(0, 0, 0, 0.2), inset -2px 0 6px rgba(255, 255, 255, 0.3)' }}></div><div style={{ position: 'absolute', bottom: 0, left: 0, width: '100px', height: '40px', background: 'linear-gradient(to bottom, #f3f4f6 0%, #e5e7eb 70%, #d1d5db 100%)', borderRadius: '3px', border: '1px solid #9ca3af', boxShadow: 'inset 0 -3px 8px rgba(0, 0, 0, 0.1)' }}></div><div style={{ position: 'absolute', top: '8px', right: '5px', width: '35px', height: '20px', background: 'linear-gradient(to bottom right, rgba(219, 234, 254, 0.8) 0%, rgba(147, 197, 253, 0.8) 100%)', borderRadius: '3px', border: '2px solid #047857', boxShadow: 'inset 0 0 8px rgba(255, 255, 255, 0.6)' }}><div style={{ position: 'absolute', top: '3px', left: '5px', width: '20px', height: '2px', background: 'linear-gradient(to bottom, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 100%)', borderRadius: '50%' }}></div></div><div style={{ position: 'absolute', top: '15px', right: '8px', width: '15px', height: '15px', background: 'linear-gradient(to bottom, rgba(219, 234, 254, 0.7) 0%, rgba(147, 197, 253, 0.7) 100%)', borderRadius: '2px', border: '2px solid #047857' }}><div style={{ position: 'absolute', bottom: '3px', left: '50%', transform: 'translateX(-50%)', width: '6px', height: '8px', backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: '3px 3px 0 0' }}></div></div><div style={{ position: 'absolute', top: '10px', left: '40px', width: '30px', height: '15px', backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #047857', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)' }}><div style={{ fontSize: '6px', fontWeight: 'bold', color: '#047857', fontFamily: "'Noto Sans Sinhala', 'Iskoola Pota', sans-serif" }}>බෙදාහැරීම්</div></div><div style={{ position: 'absolute', bottom: '8px', right: '3px', width: '8px', height: '6px', background: 'linear-gradient(to left, #fef3c7 0%, #fcd34d 100%)', borderRadius: '30%', border: '1px solid #064e3b', boxShadow: '0 0 8px rgba(252, 211, 77, 0.7)' }}><div style={{ position: 'absolute', top: '1px', right: '1px', width: '3px', height: '3px', background: 'radial-gradient(circle, #fef9c3 0%, #fef3c7 100%)', borderRadius: '50%' }}></div></div><div style={{ position: 'absolute', bottom: '15px', right: '3px', width: '8px', height: '12px', background: 'linear-gradient(to bottom, #374151 0%, #1f2937 100%)', borderRadius: '2px' }}><div style={{ position: 'absolute', top: '2px', left: '1px', right: '1px', height: '1px', backgroundColor: '#6b7280' }}></div><div style={{ position: 'absolute', top: '5px', left: '1px', right: '1px', height: '1px', backgroundColor: '#6b7280' }}></div><div style={{ position: 'absolute', top: '8px', left: '1px', right: '1px', height: '1px', backgroundColor: '#6b7280' }}></div></div><div className="animate-light-blink animation-delay-300" style={{ position: 'absolute', bottom: '20px', right: '5px', width: '5px', height: '5px', background: 'radial-gradient(circle, #fef3c7 0%, #fcd34d 100%)', borderRadius: '50%', border: '1px solid #064e3b', boxShadow: '0 0 6px rgba(252, 211, 77, 0.6)' }}></div><div className="animate-light-blink animation-delay-700" style={{ position: 'absolute', bottom: '18px', left: '5px', width: '10px', height: '6px', background: 'radial-gradient(circle, #f87171 50%, #ef4444 100%)', borderRadius: '2px', border: '1px solid #064e3b', boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)' }}></div><div style={{ position: 'absolute', bottom: '-8px', right: '15px', width: '20px', height: '20px', backgroundColor: '#0f172a', borderRadius: '50%', border: '3px solid #94a3b8', boxSizing: 'border-box', boxShadow: '0 3px 5px rgba(0, 0, 0, 0.5)', overflow: 'hidden' }}><div className="animate-wheels" style={{ position: 'absolute', inset: '1px', borderRadius: '50%', border: '2px solid #64748b', background: 'radial-gradient(circle at center, #e2e8f0 15%, transparent 15%), conic-gradient(#cbd5e1 0deg, #cbd5e1 30deg, transparent 30deg, transparent 60deg, #cbd5e1 60deg, #cbd5e1 90deg, transparent 90deg, transparent 120deg, #cbd5e1 120deg, #cbd5e1 150deg, transparent 150deg, transparent 180deg, #cbd5e1 180deg, #cbd5e1 210deg, transparent 210deg, transparent 240deg, #cbd5e1 240deg, #cbd5e1 270deg, transparent 270deg, transparent 300deg, #cbd5e1 300deg, #cbd5e1 330deg, transparent 330deg, transparent 360deg)' }}></div></div><div style={{ position: 'absolute', bottom: '-8px', left: '15px', width: '20px', height: '20px', backgroundColor: '#0f172a', borderRadius: '50%', border: '3px solid #94a3b8', boxSizing: 'border-box', boxShadow: '0 3px 5px rgba(0, 0, 0, 0.5)', overflow: 'hidden' }}><div className="animate-wheels" style={{ position: 'absolute', inset: '1px', borderRadius: '50%', border: '2px solid #64748b', background: 'radial-gradient(circle at center, #e2e8f0 15%, transparent 15%), conic-gradient(#cbd5e1 0deg, #cbd5e1 30deg, transparent 30deg, transparent 60deg, #cbd5e1 60deg, #cbd5e1 90deg, transparent 90deg, transparent 120deg, #cbd5e1 120deg, #cbd5e1 150deg, transparent 150deg, transparent 180deg, #cbd5e1 180deg, #cbd5e1 210deg, transparent 210deg, transparent 240deg, #cbd5e1 240deg, #cbd5e1 270deg, transparent 270deg, transparent 300deg, #cbd5e1 300deg, #cbd5e1 330deg, transparent 330deg, transparent 360deg)' }}></div></div><div style={{ position: 'absolute', bottom: '3px', left: '50%', transform: 'translateX(-50%)', width: '25px', height: '8px', backgroundColor: 'white', borderRadius: '2px', border: '1px solid #047857', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)' }}><div style={{ fontSize: '4px', fontWeight: 'bold', color: '#1f2937' }}>DL-9876</div></div><div style={{ position: 'absolute', bottom: '5px', left: '5px', width: '6px', height: '3px', background: 'linear-gradient(to bottom, #9ca3af 0%, #6b7280 100%)', borderRadius: '2px 0 0 2px', boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.4)' }}></div><div style={{ position: 'absolute', bottom: '5px', left: '-8px', width: '8px', height: '8px', background: 'radial-gradient(circle, rgba(209, 213, 219, 0.8) 0%, rgba(209, 213, 219, 0) 70%)', borderRadius: '50%', opacity: 0.6, animation: 'steam 1.2s ease-out infinite' }}></div></div></div>
        <div className="animate-car-right animation-delay-2500" style={{ position: 'absolute', top: '15%', marginTop: '15px', left: '-140px', width: '140px', height: '65px', zIndex: 5, filter: 'drop-shadow(0 4px 3px rgba(0, 0, 0, 0.3))' }}><div style={{ position: 'relative', width: '100%', height: '100%' }}><div style={{ position: 'absolute', bottom: 0, width: '100%', height: '40px', background: 'linear-gradient(to bottom, #f97316 0%, #ea580c 70%, #c2410c 100%)', borderRadius: '10px 12px 6px 6px', border: '1px solid #9a3412', boxShadow: 'inset 0 -3px 8px rgba(0, 0, 0, 0.2), inset 2px 0 6px rgba(255, 255, 255, 0.3)' }}></div><div style={{ position: 'absolute', bottom: '5px', left: '0', width: '35px', height: '35px', background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', borderRadius: '10px 4px 0 6px', boxShadow: 'inset 1px 1px 5px rgba(255, 255, 255, 0.4)' }}></div><div style={{ position: 'absolute', top: '8px', left: '40px', right: '8px', height: '25px', background: 'linear-gradient(to bottom, rgba(219, 234, 254, 0.7) 0%, rgba(147, 197, 253, 0.7) 100%)', borderRadius: '4px', border: '2px solid #c2410c', boxShadow: 'inset 0 0 8px rgba(255, 255, 255, 0.6)', overflow: 'hidden' }}><div style={{ display: 'flex', height: '100%', width: '100%' }}>{[...Array(4)].map((_, i) => (<div key={i} style={{ flex: '1', height: '100%', borderRight: i < 3 ? '2px solid #c2410c' : 'none', position: 'relative' }}>{i % 2 === 1 && (<div style={{ position: 'absolute', bottom: '4px', left: '50%', transform: 'translateX(-50%)', width: '6px', height: '8px', backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: '3px 3px 0 0' }}></div>)}</div>))}</div></div><div style={{ position: 'absolute', top: '8px', left: '8px', width: '25px', height: '25px', background: 'linear-gradient(to bottom right, rgba(219, 234, 254, 0.8) 0%, rgba(147, 197, 253, 0.8) 100%)', borderRadius: '4px', border: '2px solid #c2410c', boxShadow: 'inset 0 0 6px rgba(255, 255, 255, 0.6)' }}><div style={{ position: 'absolute', top: '3px', left: '3px', width: '15px', height: '2px', background: 'linear-gradient(to bottom, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 100%)', borderRadius: '50%' }}></div></div><div style={{ position: 'absolute', top: '35px', left: '50%', transform: 'translateX(-50%)', width: '40px', height: '8px', backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #c2410c', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)' }}><div style={{ fontSize: '4px', fontWeight: 'bold', color: '#c2410c' }}>SCHOOL BUS</div></div><div style={{ position: 'absolute', bottom: '25px', left: '18px', width: '8px', height: '10px', backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: '4px 4px 0 0' }}><div style={{ position: 'absolute', top: '2px', left: '1px', width: '2px', height: '1px', backgroundColor: '#f8fafc', borderRadius: '50%' }}></div><div style={{ position: 'absolute', top: '2px', right: '1px', width: '2px', height: '1px', backgroundColor: '#f8fafc', borderRadius: '50%' }}></div></div><div style={{ position: 'absolute', bottom: '8px', left: '3px', width: '8px', height: '6px', background: 'linear-gradient(to right, #fef3c7 0%, #fcd34d 100%)', borderRadius: '40%', border: '1px solid #9a3412', boxShadow: '0 0 8px rgba(252, 211, 77, 0.7)' }}><div style={{ position: 'absolute', top: '1px', left: '1px', width: '3px', height: '3px', background: 'radial-gradient(circle, #fef9c3 0%, #fef3c7 100%)', borderRadius: '50%' }}></div></div><div style={{ position: 'absolute', bottom: '20px', left: '40px', width: '15px', height: '8px', background: 'linear-gradient(to bottom, #dc2626 0%, #b91c1c 100%)', borderRadius: '2px', border: '1px solid #7f1d1d' }}><div style={{ position: 'absolute', top: '1px', left: '2px', fontSize: '3px', fontWeight: 'bold', color: 'white' }}>STOP</div></div><div style={{ position: 'absolute', bottom: '-7px', left: '18px', width: '18px', height: '18px', backgroundColor: '#0f172a', borderRadius: '50%', border: '3px solid #94a3b8', boxSizing: 'border-box', boxShadow: '0 3px 5px rgba(0, 0, 0, 0.5)', overflow: 'hidden' }}><div className="animate-wheels" style={{ position: 'absolute', inset: '1px', borderRadius: '50%', border: '2px solid #64748b', background: 'radial-gradient(circle at center, #e2e8f0 15%, transparent 15%), conic-gradient(#cbd5e1 0deg, #cbd5e1 30deg, transparent 30deg, transparent 60deg, #cbd5e1 60deg, #cbd5e1 90deg, transparent 90deg, transparent 120deg, #cbd5e1 120deg, #cbd5e1 150deg, transparent 150deg, transparent 180deg, #cbd5e1 180deg, #cbd5e1 210deg, transparent 210deg, transparent 240deg, #cbd5e1 240deg, #cbd5e1 270deg, transparent 270deg, transparent 300deg, #cbd5e1 300deg, #cbd5e1 330deg, transparent 330deg, transparent 360deg)' }}></div></div><div style={{ position: 'absolute', bottom: '-7px', right: '18px', width: '18px', height: '18px', backgroundColor: '#0f172a', borderRadius: '50%', border: '3px solid #94a3b8', boxSizing: 'border-box', boxShadow: '0 3px 5px rgba(0, 0, 0, 0.5)', overflow: 'hidden' }}><div className="animate-wheels" style={{ position: 'absolute', inset: '1px', borderRadius: '50%', border: '2px solid #64748b', background: 'radial-gradient(circle at center, #e2e8f0 15%, transparent 15%), conic-gradient(#cbd5e1 0deg, #cbd5e1 30deg, transparent 30deg, transparent 60deg, #cbd5e1 60deg, #cbd5e1 90deg, transparent 90deg, transparent 120deg, #cbd5e1 120deg, #cbd5e1 150deg, transparent 150deg, transparent 180deg, #cbd5e1 180deg, #cbd5e1 210deg, transparent 210deg, transparent 240deg, #cbd5e1 240deg, #cbd5e1 270deg, transparent 270deg, transparent 300deg, #cbd5e1 300deg, #cbd5e1 330deg, transparent 330deg, transparent 360deg)' }}></div></div><div style={{ position: 'absolute', bottom: '2px', left: '50%', transform: 'translateX(-50%)', width: '22px', height: '6px', backgroundColor: 'white', borderRadius: '2px', border: '1px solid #c2410c', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' }}><div style={{ fontSize: '3px', fontWeight: 'bold', color: '#1f2937' }}>SCH-321</div></div><div style={{ position: 'absolute', bottom: '4px', right: '8px', width: '5px', height: '3px', background: 'linear-gradient(to bottom, #9ca3af 0%, #6b7280 100%)', borderRadius: '0 2px 2px 0', boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.4)' }}></div><div className="animate-light-blink animation-delay-100" style={{ position: 'absolute', top: '3px', left: '5px', width: '6px', height: '6px', background: 'radial-gradient(circle, #fbbf24 0%, #f59e0b 100%)', borderRadius: '50%', border: '1px solid #9a3412', boxShadow: '0 0 8px rgba(251, 191, 36, 0.6)' }}></div><div className="animate-light-blink animation-delay-600" style={{ position: 'absolute', top: '3px', right: '5px', width: '6px', height: '6px', background: 'radial-gradient(circle, #fbbf24 0%, #f59e0b 100%)', borderRadius: '50%', border: '1px solid #9a3412', boxShadow: '0 0 8px rgba(251, 191, 36, 0.6)' }}></div></div></div>
        <div className="animate-car-left animation-delay-2000" style={{ position: 'absolute', top: '60%', marginTop: '15px', right: '-100px', width: '100px', height: '45px', zIndex: 5, filter: 'drop-shadow(0 4px 3px rgba(0, 0, 0, 0.3))' }}><div style={{ position: 'relative', width: '100%', height: '100%' }}><div style={{ position: 'absolute', bottom: 0, width: '100%', height: '25px', background: 'linear-gradient(to bottom, #dc2626 0%, #b91c1c 70%, #991b1b 100%)', borderRadius: '15px 10px 5px 5px', border: '1px solid #7f1d1d', boxShadow: 'inset 0 -3px 8px rgba(0, 0, 0, 0.2), inset -2px 0 6px rgba(255, 255, 255, 0.3)' }}></div><div style={{ position: 'absolute', bottom: '25px', left: '15px', right: '20px', height: '15px', background: 'linear-gradient(to bottom, #7f1d1d 0%, #991b1b 100%)', borderRadius: '8px 8px 0 0', border: '1px solid #7f1d1d', borderBottom: 'none' }}></div><div style={{ position: 'absolute', top: '8px', right: '10px', width: '20px', height: '12px', background: 'linear-gradient(to bottom right, rgba(219, 234, 254, 0.8) 0%, rgba(147, 197, 253, 0.8) 100%)', borderRadius: '3px', border: '1px solid #7f1d1d', boxShadow: 'inset 0 0 5px rgba(255, 255, 255, 0.6)' }}><div style={{ position: 'absolute', top: '2px', left: '3px', width: '12px', height: '1px', background: 'linear-gradient(to bottom, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 100%)', borderRadius: '50%' }}></div></div><div style={{ position: 'absolute', top: '8px', left: '25px', right: '35px', height: '12px', background: 'linear-gradient(to bottom, rgba(219, 234, 254, 0.7) 0%, rgba(147, 197, 253, 0.7) 100%)', borderRadius: '3px 0 0 0', border: '1px solid #7f1d1d', boxShadow: 'inset 0 0 5px rgba(255, 255, 255, 0.6)' }}><div style={{ position: 'absolute', bottom: '2px', left: '8px', width: '5px', height: '6px', backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: '2px 2px 0 0' }}></div><div style={{ position: 'absolute', bottom: '2px', right: '8px', width: '5px', height: '6px', backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: '2px 2px 0 0' }}></div></div><div style={{ position: 'absolute', bottom: '8px', right: '5px', width: '8px', height: '5px', background: 'linear-gradient(to left, #fef3c7 0%, #fcd34d 100%)', borderRadius: '50%', border: '1px solid #7f1d1d', boxShadow: '0 0 8px rgba(252, 211, 77, 0.6)' }}><div style={{ position: 'absolute', top: '1px', right: '1px', width: '3px', height: '2px', backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '50%' }}></div></div><div style={{ position: 'absolute', bottom: '6px', right: '-15px', width: '20px', height: '10px', background: 'linear-gradient(to right, rgba(252, 211, 77, 0.2) 0%, rgba(252, 211, 77, 0) 100%)', borderRadius: '50%', transform: 'scaleX(2)' }}></div><div className="animate-light-blink animation-delay-400" style={{ position: 'absolute', bottom: '15px', right: '8px', width: '4px', height: '4px', background: 'radial-gradient(circle, #fef3c7 0%, #fcd34d 100%)', borderRadius: '50%', border: '1px solid #7f1d1d', boxShadow: '0 0 6px rgba(252, 211, 77, 0.6)' }}></div><div className="animate-light-blink animation-delay-500" style={{ position: 'absolute', bottom: '8px', left: '5px', width: '6px', height: '4px', background: 'radial-gradient(circle, #f87171 50%, #ef4444 100%)', borderRadius: '2px', border: '1px solid #7f1d1d', boxShadow: '0 0 6px rgba(239, 68, 68, 0.6)' }}></div><div style={{ position: 'absolute', bottom: '-5px', right: '20px', width: '16px', height: '16px', backgroundColor: '#0f172a', borderRadius: '50%', border: '3px solid #94a3b8', boxSizing: 'border-box', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)', overflow: 'hidden' }}><div className="animate-wheels" style={{ position: 'absolute', inset: '1px', borderRadius: '50%', border: '1px solid #64748b', background: 'radial-gradient(circle at center, #e2e8f0 15%, transparent 15%), conic-gradient(#cbd5e1 0deg, #cbd5e1 30deg, transparent 30deg, transparent 60deg, #cbd5e1 60deg, #cbd5e1 90deg, transparent 90deg, transparent 120deg, #cbd5e1 120deg, #cbd5e1 150deg, transparent 150deg, transparent 180deg, #cbd5e1 180deg, #cbd5e1 210deg, transparent 210deg, transparent 240deg, #cbd5e1 240deg, #cbd5e1 270deg, transparent 270deg, transparent 300deg, #cbd5e1 300deg, #cbd5e1 330deg, transparent 330deg, transparent 360deg)' }}></div></div><div style={{ position: 'absolute', bottom: '-5px', left: '20px', width: '16px', height: '16px', backgroundColor: '#0f172a', borderRadius: '50%', border: '3px solid #94a3b8', boxSizing: 'border-box', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)', overflow: 'hidden' }}><div className="animate-wheels" style={{ position: 'absolute', inset: '1px', borderRadius: '50%', border: '1px solid #64748b', background: 'radial-gradient(circle at center, #e2e8f0 15%, transparent 15%), conic-gradient(#cbd5e1 0deg, #cbd5e1 30deg, transparent 30deg, transparent 60deg, #cbd5e1 60deg, #cbd5e1 90deg, transparent 90deg, transparent 120deg, #cbd5e1 120deg, #cbd5e1 150deg, transparent 150deg, transparent 180deg, #cbd5e1 180deg, #cbd5e1 210deg, transparent 210deg, transparent 240deg, #cbd5e1 240deg, #cbd5e1 270deg, transparent 270deg, transparent 300deg, #cbd5e1 300deg, #cbd5e1 330deg, transparent 330deg, transparent 360deg)' }}></div></div><div style={{ position: 'absolute', bottom: '2px', left: '50%', transform: 'translateX(-50%)', width: '20px', height: '6px', backgroundColor: 'white', borderRadius: '2px', border: '1px solid #7f1d1d', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' }}><div style={{ fontSize: '3px', fontWeight: 'bold', color: '#1f2937' }}>CAR-456</div></div><div style={{ position: 'absolute', bottom: '3px', left: '8px', width: '5px', height: '2px', background: 'linear-gradient(to right, #9ca3af 0%, #6b7280 100%)', borderRadius: '1px 0 0 1px', boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.4)' }}></div><div style={{ position: 'absolute', bottom: '3px', left: '5px', width: '6px', height: '6px', background: 'radial-gradient(circle, rgba(209, 213, 219, 0.8) 0%, rgba(209, 213, 219, 0) 70%)', borderRadius: '50%', opacity: 0.6, animation: 'steam 1s ease-out infinite' }}></div></div></div>
        <div className="animate-car-right animation-delay-1500" style={{ position: 'absolute', top: '60%', marginTop: '40px', left: '-60px', width: '60px', height: '35px', zIndex: 5, filter: 'drop-shadow(0 4px 3px rgba(0, 0, 0, 0.3))' }}><div style={{ position: 'relative', width: '100%', height: '100%' }}><div style={{ position: 'absolute', bottom: '8px', left: '15px', width: '30px', height: '3px', background: 'linear-gradient(to bottom, #059669 0%, #047857 100%)', borderRadius: '2px', transform: 'rotate(10deg)', transformOrigin: 'left center' }}></div><div style={{ position: 'absolute', bottom: '12px', left: '20px', width: '20px', height: '3px', background: 'linear-gradient(to bottom, #059669 0%, #047857 100%)', borderRadius: '2px', transform: 'rotate(-20deg)', transformOrigin: 'left center' }}></div><div style={{ position: 'absolute', bottom: '18px', left: '22px', width: '8px', height: '3px', background: 'linear-gradient(to bottom, #1f2937 0%, #111827 100%)', borderRadius: '2px' }}></div><div style={{ position: 'absolute', bottom: '20px', right: '15px', width: '10px', height: '2px', background: 'linear-gradient(to bottom, #6b7280 0%, #4b5563 100%)', borderRadius: '1px' }}></div><div style={{ position: 'absolute', bottom: '22px', right: '18px', width: '2px', height: '8px', background: 'linear-gradient(to bottom, #6b7280 0%, #4b5563 100%)', borderRadius: '1px' }}></div><div style={{ position: 'absolute', bottom: '0', right: '10px', width: '16px', height: '16px', backgroundColor: '#0f172a', borderRadius: '50%', border: '2px solid #94a3b8', boxSizing: 'border-box', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)', overflow: 'hidden' }}><div className="animate-wheels" style={{ position: 'absolute', inset: '1px', borderRadius: '50%', border: '1px solid #64748b', background: 'radial-gradient(circle at center, transparent 40%, #cbd5e1 40%, #cbd5e1 45%, transparent 45%), conic-gradient(#cbd5e1 0deg, #cbd5e1 10deg, transparent 10deg, transparent 80deg, #cbd5e1 80deg, #cbd5e1 90deg, transparent 90deg, transparent 170deg, #cbd5e1 170deg, #cbd5e1 180deg, transparent 180deg, transparent 260deg, #cbd5e1 260deg, #cbd5e1 270deg, transparent 270deg, transparent 350deg, #cbd5e1 350deg, #cbd5e1 360deg)' }}></div></div><div style={{ position: 'absolute', bottom: '0', left: '8px', width: '16px', height: '16px', backgroundColor: '#0f172a', borderRadius: '50%', border: '2px solid #94a3b8', boxSizing: 'border-box', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)', overflow: 'hidden' }}><div className="animate-wheels" style={{ position: 'absolute', inset: '1px', borderRadius: '50%', border: '1px solid #64748b', background: 'radial-gradient(circle at center, transparent 40%, #cbd5e1 40%, #cbd5e1 45%, transparent 45%), conic-gradient(#cbd5e1 0deg, #cbd5e1 10deg, transparent 10deg, transparent 80deg, #cbd5e1 80deg, #cbd5e1 90deg, transparent 90deg, transparent 170deg, #cbd5e1 170deg, #cbd5e1 180deg, transparent 180deg, transparent 260deg, #cbd5e1 260deg, #cbd5e1 270deg, transparent 270deg, transparent 350deg, #cbd5e1 350deg, #cbd5e1 360deg)' }}></div></div><div style={{ position: 'absolute', bottom: '16px', left: '18px', width: '8px', height: '12px', backgroundColor: '#3b82f6', borderRadius: '4px 4px 0 0' }}><div style={{ position: 'absolute', top: '-6px', left: '1px', width: '6px', height: '6px', background: 'linear-gradient(to bottom, #fbbf24 0%, #f59e0b 100%)', borderRadius: '50%' }}><div style={{ position: 'absolute', top: '2px', left: '1px', width: '1px', height: '1px', backgroundColor: '#111827', borderRadius: '50%' }}></div><div style={{ position: 'absolute', top: '2px', right: '1px', width: '1px', height: '1px', backgroundColor: '#111827', borderRadius: '50%' }}></div></div><div style={{ position: 'absolute', top: '2px', right: '-6px', width: '8px', height: '2px', backgroundColor: '#3b82f6', borderRadius: '1px', transform: 'rotate(-15deg)' }}></div></div><div style={{ position: 'absolute', bottom: '12px', right: '8px', width: '4px', height: '3px', background: 'linear-gradient(to left, #fef3c7 0%, #fcd34d 100%)', borderRadius: '50%', border: '1px solid #047857', boxShadow: '0 0 6px rgba(252, 211, 77, 0.6)' }}></div><div className="animate-light-blink animation-delay-800" style={{ position: 'absolute', bottom: '8px', left: '5px', width: '3px', height: '2px', background: 'radial-gradient(circle, #f87171 50%, #ef4444 100%)', borderRadius: '1px', border: '1px solid #047857', boxShadow: '0 0 4px rgba(239, 68, 68, 0.6)' }}></div></div></div>
        <div className="animate-car-left animation-delay-3000" style={{ position: 'absolute', top: '60%', marginTop: '5px', right: '-90px', width: '90px', height: '40px', zIndex: 5, filter: 'drop-shadow(0 4px 3px rgba(0, 0, 0, 0.3))' }}><div style={{ position: 'relative', width: '100%', height: '100%' }}><div style={{ position: 'absolute', bottom: 0, width: '100%', height: '28px', background: 'linear-gradient(to bottom, #7c3aed 0%, #6d28d9 70%, #5b21b6 100%)', borderRadius: '8px 10px 4px 4px', border: '1px solid #581c87', boxShadow: 'inset 0 -3px 8px rgba(0, 0, 0, 0.2), inset -2px 0 6px rgba(255, 255, 255, 0.3)' }}></div><div style={{ position: 'absolute', top: '5px', right: '5px', width: '20px', height: '12px', background: 'linear-gradient(to bottom right, rgba(219, 234, 254, 0.8) 0%, rgba(147, 197, 253, 0.8) 100%)', borderRadius: '3px', border: '1px solid #581c87', boxShadow: 'inset 0 0 5px rgba(255, 255, 255, 0.6)' }}><div style={{ position: 'absolute', top: '2px', left: '3px', width: '12px', height: '1px', background: 'linear-gradient(to bottom, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 100%)', borderRadius: '50%' }}></div></div><div style={{ position: 'absolute', top: '5px', left: '25px', right: '30px', height: '12px', background: 'linear-gradient(to bottom, rgba(219, 234, 254, 0.7) 0%, rgba(147, 197, 253, 0.7) 100%)', borderRadius: '3px 0 0 0', border: '1px solid #581c87', boxShadow: 'inset 0 0 5px rgba(255, 255, 255, 0.6)' }}><div style={{ position: 'absolute', bottom: '2px', left: '6px', width: '4px', height: '6px', backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: '2px 2px 0 0' }}></div><div style={{ position: 'absolute', bottom: '2px', right: '6px', width: '4px', height: '6px', backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: '2px 2px 0 0' }}></div></div><div style={{ position: 'absolute', bottom: '18px', right: '15px', width: '6px', height: '8px', backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: '3px 3px 0 0' }}></div><div style={{ position: 'absolute', bottom: '8px', right: '3px', width: '6px', height: '4px', background: 'linear-gradient(to left, #fef3c7 0%, #fcd34d 100%)', borderRadius: '50%', border: '1px solid #581c87', boxShadow: '0 0 6px rgba(252, 211, 77, 0.6)' }}><div style={{ position: 'absolute', top: '1px', right: '1px', width: '2px', height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '50%' }}></div></div><div className="animate-light-blink animation-delay-300" style={{ position: 'absolute', bottom: '14px', right: '6px', width: '4px', height: '4px', background: 'radial-gradient(circle, #fef3c7 0%, #fcd34d 100%)', borderRadius: '50%', border: '1px solid #581c87', boxShadow: '0 0 5px rgba(252, 211, 77, 0.6)' }}></div><div className="animate-light-blink animation-delay-600" style={{ position: 'absolute', bottom: '8px', left: '3px', width: '5px', height: '3px', background: 'radial-gradient(circle, #f87171 50%, #ef4444 100%)', borderRadius: '2px', border: '1px solid #581c87', boxShadow: '0 0 5px rgba(239, 68, 68, 0.6)' }}></div><div style={{ position: 'absolute', top: '18px', left: '50%', transform: 'translateX(-50%)', width: '25px', height: '6px', backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #581c87', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' }}><div style={{ fontSize: '3px', fontWeight: 'bold', color: '#581c87', fontFamily: "'Noto Sans Sinhala', 'Iskoola Pota', sans-serif" }}>පවුල</div></div><div style={{ position: 'absolute', bottom: '-5px', right: '15px', width: '14px', height: '14px', backgroundColor: '#0f172a', borderRadius: '50%', border: '2px solid #94a3b8', boxSizing: 'border-box', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)', overflow: 'hidden' }}><div className="animate-wheels" style={{ position: 'absolute', inset: '1px', borderRadius: '50%', border: '1px solid #64748b', background: 'radial-gradient(circle at center, #e2e8f0 15%, transparent 15%), conic-gradient(#cbd5e1 0deg, #cbd5e1 30deg, transparent 30deg, transparent 60deg, #cbd5e1 60deg, #cbd5e1 90deg, transparent 90deg, transparent 120deg, #cbd5e1 120deg, #cbd5e1 150deg, transparent 150deg, transparent 180deg, #cbd5e1 180deg, #cbd5e1 210deg, transparent 210deg, transparent 240deg, #cbd5e1 240deg, #cbd5e1 270deg, transparent 270deg, transparent 300deg, #cbd5e1 300deg, #cbd5e1 330deg, transparent 330deg, transparent 360deg)' }}></div></div><div style={{ position: 'absolute', bottom: '-5px', left: '15px', width: '14px', height: '14px', backgroundColor: '#0f172a', borderRadius: '50%', border: '2px solid #94a3b8', boxSizing: 'border-box', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)', overflow: 'hidden' }}><div className="animate-wheels" style={{ position: 'absolute', inset: '1px', borderRadius: '50%', border: '1px solid #64748b', background: 'radial-gradient(circle at center, #e2e8f0 15%, transparent 15%), conic-gradient(#cbd5e1 0deg, #cbd5e1 30deg, transparent 30deg, transparent 60deg, #cbd5e1 60deg, #cbd5e1 90deg, transparent 90deg, transparent 120deg, #cbd5e1 120deg, #cbd5e1 150deg, transparent 150deg, transparent 180deg, #cbd5e1 180deg, #cbd5e1 210deg, transparent 210deg, transparent 240deg, #cbd5e1 240deg, #cbd5e1 270deg, transparent 270deg, transparent 300deg, #cbd5e1 300deg, #cbd5e1 330deg, transparent 330deg, transparent 360deg)' }}></div></div><div style={{ position: 'absolute', bottom: '2px', left: '50%', transform: 'translateX(-50%)', width: '18px', height: '5px', backgroundColor: 'white', borderRadius: '1px', border: '1px solid #581c87', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' }}><div style={{ fontSize: '3px', fontWeight: 'bold', color: '#1f2937' }}>VAN-789</div></div><div style={{ position: 'absolute', bottom: '3px', left: '5px', width: '4px', height: '2px', background: 'linear-gradient(to right, #9ca3af 0%, #6b7280 100%)', borderRadius: '1px 0 0 1px', boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.4)' }}></div><div style={{ position: 'absolute', bottom: '3px', left: '2px', width: '5px', height: '5px', background: 'radial-gradient(circle, rgba(209, 213, 219, 0.8) 0%, rgba(209, 213, 219, 0) 70%)', borderRadius: '50%', opacity: 0.6, animation: 'steam 0.9s ease-out infinite' }}></div></div></div>
        <div className="animate-car-left animation-delay-1200" style={{ position: 'absolute', top: '15%', marginTop: '25px', right: '-110px', width: '110px', height: '55px', zIndex: 5, filter: 'drop-shadow(0 4px 3px rgba(0, 0, 0, 0.3))' }}><div style={{ position: 'relative', width: '100%', height: '100%' }}><div style={{ position: 'absolute', bottom: 0, width: '100%', height: '35px', background: 'linear-gradient(to bottom, #1e40af 0%, #1d4ed8 70%, #1e3a8a 100%)', borderRadius: '8px 12px 5px 5px', border: '1px solid #1e3a8a', boxShadow: 'inset 0 -3px 8px rgba(0, 0, 0, 0.2), inset -2px 0 6px rgba(255, 255, 255, 0.3)' }}></div><div style={{ position: 'absolute', bottom: '35px', left: '15px', right: '5px', height: '15px', background: 'linear-gradient(to bottom, #1e3a8a 0%, #1e40af 100%)', borderRadius: '5px 8px 0 0', border: '1px solid #1e3a8a', borderBottom: 'none' }}></div><div style={{ position: 'absolute', top: '8px', right: '5px', width: '25px', height: '15px', background: 'linear-gradient(to bottom right, rgba(219, 234, 254, 0.8) 0%, rgba(147, 197, 253, 0.8) 100%)', borderRadius: '3px', border: '1px solid #1e3a8a', boxShadow: 'inset 0 0 6px rgba(255, 255, 255, 0.6)' }}><div style={{ position: 'absolute', top: '2px', left: '3px', width: '15px', height: '2px', background: 'linear-gradient(to bottom, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 100%)', borderRadius: '50%' }}></div></div><div style={{ position: 'absolute', top: '8px', left: '35px', right: '35px', height: '15px', background: 'linear-gradient(to bottom, rgba(219, 234, 254, 0.7) 0%, rgba(147, 197, 253, 0.7) 100%)', borderRadius: '3px 0 0 0', border: '1px solid #1e3a8a', boxShadow: 'inset 0 0 6px rgba(255, 255, 255, 0.6)' }}><div style={{ position: 'absolute', bottom: '3px', left: '8px', width: '6px', height: '8px', backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: '3px 3px 0 0' }}></div><div style={{ position: 'absolute', bottom: '3px', right: '8px', width: '6px', height: '8px', backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: '3px 3px 0 0' }}></div></div><div style={{ position: 'absolute', bottom: '8px', left: '40px', width: '25px', height: '25px', background: 'linear-gradient(to bottom, rgba(219, 234, 254, 0.6) 0%, rgba(147, 197, 253, 0.6) 100%)', borderRadius: '3px', border: '2px solid #1e3a8a', boxShadow: 'inset 0 0 5px rgba(255, 255, 255, 0.4)' }}><div style={{ position: 'absolute', top: '12px', right: '2px', width: '3px', height: '5px', background: 'linear-gradient(to bottom, #94a3b8 0%, #64748b 100%)', borderRadius: '2px', border: '1px solid #475569' }}></div></div><div style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', width: '35px', height: '10px', backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #1e3a8a', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)' }}><div style={{ fontSize: '5px', fontWeight: 'bold', color: '#1e3a8a', fontFamily: "'Noto Sans Sinhala', 'Iskoola Pota', sans-serif" }}>ශ්‍රී සේවා</div></div><div style={{ position: 'absolute', bottom: '10px', right: '3px', width: '8px', height: '6px', background: 'linear-gradient(to left, #fef3c7 0%, #fcd34d 100%)', borderRadius: '50%', border: '1px solid #1e3a8a', boxShadow: '0 0 8px rgba(252, 211, 77, 0.6)' }}><div style={{ position: 'absolute', top: '1px', right: '1px', width: '3px', height: '2px', backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '50%' }}></div></div><div style={{ position: 'absolute', bottom: '8px', right: '-20px', width: '25px', height: '12px', background: 'linear-gradient(to right, rgba(252, 211, 77, 0.2) 0%, rgba(252, 211, 77, 0) 100%)', borderRadius: '50%', transform: 'scaleX(2)' }}></div><div className="animate-light-blink animation-delay-200" style={{ position: 'absolute', bottom: '18px', right: '8px', width: '5px', height: '5px', background: 'radial-gradient(circle, #fef3c7 0%, #fcd34d 100%)', borderRadius: '50%', border: '1px solid #1e3a8a', boxShadow: '0 0 6px rgba(252, 211, 77, 0.6)' }}></div><div className="animate-light-blink animation-delay-400" style={{ position: 'absolute', bottom: '10px', left: '5px', width: '6px', height: '4px', background: 'radial-gradient(circle, #f87171 50%, #ef4444 100%)', borderRadius: '2px', border: '1px solid #1e3a8a', boxShadow: '0 0 6px rgba(239, 68, 68, 0.6)' }}></div><div style={{ position: 'absolute', bottom: '-6px', right: '20px', width: '18px', height: '18px', backgroundColor: '#0f172a', borderRadius: '50%', border: '3px solid #94a3b8', boxSizing: 'border-box', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)', overflow: 'hidden' }}><div className="animate-wheels" style={{ position: 'absolute', inset: '1px', borderRadius: '50%', border: '1px solid #64748b', background: 'radial-gradient(circle at center, #e2e8f0 15%, transparent 15%), conic-gradient(#cbd5e1 0deg, #cbd5e1 30deg, transparent 30deg, transparent 60deg, #cbd5e1 60deg, #cbd5e1 90deg, transparent 90deg, transparent 120deg, #cbd5e1 120deg, #cbd5e1 150deg, transparent 150deg, transparent 180deg, #cbd5e1 180deg, #cbd5e1 210deg, transparent 210deg, transparent 240deg, #cbd5e1 240deg, #cbd5e1 270deg, transparent 270deg, transparent 300deg, #cbd5e1 300deg, #cbd5e1 330deg, transparent 330deg, transparent 360deg)' }}></div></div><div style={{ position: 'absolute', bottom: '-6px', left: '20px', width: '18px', height: '18px', backgroundColor: '#0f172a', borderRadius: '50%', border: '3px solid #94a3b8', boxSizing: 'border-box', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)', overflow: 'hidden' }}><div className="animate-wheels" style={{ position: 'absolute', inset: '1px', borderRadius: '50%', border: '1px solid #64748b', background: 'radial-gradient(circle at center, #e2e8f0 15%, transparent 15%), conic-gradient(#cbd5e1 0deg, #cbd5e1 30deg, transparent 30deg, transparent 60deg, #cbd5e1 60deg, #cbd5e1 90deg, transparent 90deg, transparent 120deg, #cbd5e1 120deg, #cbd5e1 150deg, transparent 150deg, transparent 180deg, #cbd5e1 180deg, #cbd5e1 210deg, transparent 210deg, transparent 240deg, #cbd5e1 240deg, #cbd5e1 270deg, transparent 270deg, transparent 300deg, #cbd5e1 300deg, #cbd5e1 330deg, transparent 330deg, transparent 360deg)' }}></div></div><div style={{ position: 'absolute', bottom: '2px', left: '50%', transform: 'translateX(-50%)', width: '22px', height: '6px', backgroundColor: 'white', borderRadius: '2px', border: '1px solid #1e3a8a', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' }}><div style={{ fontSize: '3px', fontWeight: 'bold', color: '#1f2937' }}>VN-7890</div></div><div style={{ position: 'absolute', bottom: '4px', left: '8px', width: '6px', height: '3px', background: 'linear-gradient(to right, #9ca3af 0%, #6b7280 100%)', borderRadius: '1px 0 0 1px', boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.4)' }}></div><div style={{ position: 'absolute', bottom: '4px', left: '3px', width: '7px', height: '7px', background: 'radial-gradient(circle, rgba(209, 213, 219, 0.8) 0%, rgba(209, 213, 219, 0) 70%)', borderRadius: '50%', opacity: 0.6, animation: 'steam 1.1s ease-out infinite' }}></div></div></div>
      </div>

      {/* Navigation */}
      <nav style={{
        backgroundColor: currentThemeStyles.navBg,
        backdropFilter: 'blur(12px)',
        borderBottom: currentThemeStyles.navBorder,
        padding: '1rem 0',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link href={`/sysadmin/users/${userId}`} style={{ color: currentThemeStyles.textSecondary, textDecoration: 'none', fontSize: '0.875rem' }}>
              ← Back to User
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PencilIcon width={24} height={24} color="#f59e0b" />
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: currentThemeStyles.textPrimary, margin: 0 }}>
                  Edit User: {formData.name}
                </h1>
                <p style={{ fontSize: '0.875rem', color: currentThemeStyles.textSecondary, margin: 0 }}>
                  {formData.email}
                </p>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {hasChanges() && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b' }}>
                <ExclamationTriangleIcon width={16} height={16} />
                <span style={{ fontSize: '0.875rem' }}>Unsaved changes</span>
              </div>
            )}
            <ThemeSwitcher />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '2rem 1.5rem', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '900px', width: '100%' }}>
          <form onSubmit={handleSubmit}>
            {errors.submit && (
              <div style={{ backgroundColor: currentThemeStyles.errorBg, color: currentThemeStyles.errorText, padding: '1rem', borderRadius: '0.5rem', marginBottom: '2rem', border: `1px solid ${currentThemeStyles.errorBorder}` }}>
                {errors.submit}
              </div>
            )}

            {/* Basic Information */}
            <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '2rem', borderRadius: '1rem', border: currentThemeStyles.glassPanelBorder, boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', marginBottom: '2rem' }}>
              <h2 style={{ color: currentThemeStyles.textPrimary, fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
                Basic Information
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {/* Name */}
                <div>
                  <label style={{ display: 'block', color: currentThemeStyles.textPrimary, fontWeight: '600', marginBottom: '0.5rem' }}>Full Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '0.5rem', border: `1px solid ${errors.name ? currentThemeStyles.inputErrorBorder : currentThemeStyles.inputBorder}`, backgroundColor: currentThemeStyles.inputBg, color: currentThemeStyles.textPrimary, fontSize: '1rem', boxSizing: 'border-box', outline: 'none' }} placeholder="Enter full name" />
                  {errors.name && <p style={{ color: currentThemeStyles.errorText, fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.name}</p>}
                </div>
                {/* Email */}
                <div>
                  <label style={{ display: 'block', color: currentThemeStyles.textPrimary, fontWeight: '600', marginBottom: '0.5rem' }}>Email Address *</label>
                  <div style={{ position: 'relative' }}>
                    <EnvelopeIcon width={20} height={20} color={currentThemeStyles.textSecondary} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input type="email" name="email" value={formData.email} onChange={handleChange} style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 3rem', borderRadius: '0.5rem', border: `1px solid ${errors.email ? currentThemeStyles.inputErrorBorder : currentThemeStyles.inputBorder}`, backgroundColor: currentThemeStyles.inputBg, color: currentThemeStyles.textPrimary, fontSize: '1rem', boxSizing: 'border-box', outline: 'none' }} placeholder="user@example.com" />
                  </div>
                  {errors.email && <p style={{ color: currentThemeStyles.errorText, fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.email}</p>}
                </div>
                {/* Phone */}
                <div>
                  <label style={{ display: 'block', color: currentThemeStyles.textPrimary, fontWeight: '600', marginBottom: '0.5rem' }}>Phone Number</label>
                  <div style={{ position: 'relative' }}>
                    <PhoneIcon width={20} height={20} color={currentThemeStyles.textSecondary} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 3rem', borderRadius: '0.5rem', border: `1px solid ${currentThemeStyles.inputBorder}`, backgroundColor: currentThemeStyles.inputBg, color: currentThemeStyles.textPrimary, fontSize: '1rem', boxSizing: 'border-box', outline: 'none' }} placeholder="+94 77 123 4567" />
                  </div>
                </div>
              </div>
            </div>

            {/* Role & Permissions */}
            <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '2rem', borderRadius: '1rem', border: currentThemeStyles.glassPanelBorder, boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', marginBottom: '2rem' }}>
              <h2 style={{ color: currentThemeStyles.textPrimary, fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Role & Permissions</h2>
              {/* Role Selection */}
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', color: currentThemeStyles.textPrimary, fontWeight: '600', marginBottom: '0.5rem' }}>User Role *</label>
                <select name="role" value={formData.role} onChange={handleChange} style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '0.5rem', border: `1px solid ${currentThemeStyles.inputBorder}`, backgroundColor: currentThemeStyles.inputBg, color: getRoleColor(formData.role), fontSize: '1rem', boxSizing: 'border-box', outline: 'none', fontWeight: '600' }}>
                  <option value="client">👤 Client</option>
                  <option value="customer_service">💬 Customer Service</option>
                  <option value="route_admin">🚌 Route Administrator</option>
                  <option value="company_admin">🏢 Company Administrator</option>
                  <option value="system_admin">🔧 System Administrator</option>
                </select>
                <div style={{ backgroundColor: theme === 'dark' ? '#334155' : '#f1f5f9', padding: '1rem', borderRadius: '0.5rem', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: getRoleColor(formData.role) }}>{getRoleIcon(formData.role)}</span>
                  <span style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem' }}>{getRoleDescription(formData.role)}</span>
                </div>
              </div>
              {/* Role-specific fields */}
              {formData.role === 'customer_service' && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', color: currentThemeStyles.textPrimary, fontWeight: '600', marginBottom: '0.5rem' }}>Department *</label>
                  <input type="text" name="department" value={formData.department} onChange={handleChange} style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '0.5rem', border: `1px solid ${errors.department ? currentThemeStyles.inputErrorBorder : currentThemeStyles.inputBorder}`, backgroundColor: currentThemeStyles.inputBg, color: currentThemeStyles.textPrimary, fontSize: '1rem', boxSizing: 'border-box', outline: 'none' }} placeholder="e.g., Customer Support" />
                  {errors.department && <p style={{ color: currentThemeStyles.errorText, fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.department}</p>}
                </div>
              )}
              {formData.role === 'company_admin' && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', color: currentThemeStyles.textPrimary, fontWeight: '600', marginBottom: '0.5rem' }}>Company Name *</label>
                  <div style={{ position: 'relative' }}>
                    <BuildingOfficeIcon width={20} height={20} color={currentThemeStyles.textSecondary} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input type="text" name="company" value={formData.company} onChange={handleChange} style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 3rem', borderRadius: '0.5rem', border: `1px solid ${errors.company ? currentThemeStyles.inputErrorBorder : currentThemeStyles.inputBorder}`, backgroundColor: currentThemeStyles.inputBg, color: currentThemeStyles.textPrimary, fontSize: '1rem', boxSizing: 'border-box', outline: 'none' }} placeholder="e.g., ABC Transport Company" />
                  </div>
                  {errors.company && <p style={{ color: currentThemeStyles.errorText, fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.company}</p>}
                </div>
              )}
              {/* Permissions */}
              <div>
                <label style={{ display: 'block', color: currentThemeStyles.textPrimary, fontWeight: '600', marginBottom: '0.5rem' }}>Permissions</label>
                <div style={{ backgroundColor: theme === 'dark' ? '#334155' : '#f1f5f9', padding: '1rem', borderRadius: '0.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  {getAvailablePermissions().map((permission) => (
                    <label key={permission} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: currentThemeStyles.textPrimary, fontSize: '0.875rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={formData.permissions.includes(permission)} onChange={(e) => handlePermissionChange(permission, e.target.checked)} style={{ accentColor: '#3b82f6' }} />
                      {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '2rem', borderRadius: '1rem', border: currentThemeStyles.glassPanelBorder, boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', marginBottom: '2rem' }}>
              <h2 style={{ color: currentThemeStyles.textPrimary, fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Account Settings</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: currentThemeStyles.textPrimary, cursor: 'pointer' }}>
                  <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} style={{ accentColor: '#3b82f6' }} />
                  <div>
                    <div style={{ fontWeight: '500' }}>Active Account</div>
                    <div style={{ color: currentThemeStyles.textSecondary, fontSize: '0.875rem' }}>User can login and access the system</div>
                  </div>
                </label>
                {!formData.isActive && (
                  <div style={{ backgroundColor: currentThemeStyles.errorBg, padding: '1rem', borderRadius: '0.5rem', border: `1px solid ${currentThemeStyles.errorBorder}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: currentThemeStyles.errorText }}>
                      <ExclamationTriangleIcon width={16} height={16} />
                      <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Account Deactivated</span>
                    </div>
                    <p style={{ color: currentThemeStyles.errorText, fontSize: '0.875rem', margin: '0.5rem 0 0 0' }}>This user will not be able to login or access any system features until reactivated.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Buttons */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <Link href={`/sysadmin/users/${userId}`} style={{ backgroundColor: currentThemeStyles.buttonSecondaryBg, color: currentThemeStyles.buttonSecondaryText, padding: '0.875rem 1.5rem', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: '500' }}>
                Cancel
              </Link>
              <button type="submit" disabled={saving || !hasChanges()} style={{ backgroundColor: hasChanges() ? currentThemeStyles.buttonPrimaryBg : currentThemeStyles.textMuted, color: currentThemeStyles.buttonPrimaryText, padding: '0.875rem 1.5rem', borderRadius: '0.5rem', border: 'none', fontWeight: '500', cursor: hasChanges() ? 'pointer' : 'not-allowed', opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {saving ? 'Saving Changes...' : 'Save Changes'}
                {hasChanges() && <CheckCircleIcon width={20} height={20} />}
              </button>
            </div>

            {/* System Admin Warning */}
            {formData.role === 'system_admin' && (
              <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '1.5rem', borderRadius: '1rem', border: '1px solid #ef4444', marginTop: '2rem', backdropFilter: 'blur(12px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <ExclamationTriangleIcon width={20} height={20} color="#ef4444" />
                  <h3 style={{ color: currentThemeStyles.textPrimary, fontSize: '1rem', fontWeight: '600', margin: 0 }}>System Administrator Role</h3>
                </div>
                <p style={{ color: currentThemeStyles.textSecondary, margin: 0, lineHeight: '1.5' }}>
                  You are editing a system administrator account. This role has full access to all system functions and should only be assigned to trusted personnel. Changes to system administrator accounts are logged and monitored.
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}