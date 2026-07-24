import React, { useState, useEffect, useRef } from 'react';
import { User } from './types';
import { fetchUserApi, syncUserApi } from './lib/api';
import { Header } from './components/Header';
import { Navbar, TabType } from './components/Navbar';
import { AirdropTapGame } from './components/AirdropTapGame';
import { TaskList } from './components/TaskList';
import { LeaderboardView } from './components/LeaderboardView';
import { UpgradesView } from './components/UpgradesView';
import { ReferralView } from './components/ReferralView';
import { AdminPanel } from './components/AdminPanel';
import { AuthModal } from './components/AuthModal';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('game');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [urlRefCode, setUrlRefCode] = useState<string>('');

  // Extract ?ref= Referral code from URL if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      setUrlRefCode(ref);
      if (!user) {
        setShowAuthModal(true);
      }
    }

    // Load saved user session
    const savedUserId = localStorage.getItem('nxb_user_id');
    if (savedUserId) {
      fetchUserApi(savedUserId).then(res => {
        if (res.success && res.user) {
          setUser(res.user);
        }
      });
    }
  }, []);

  const userRef = useRef<User | null>(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Periodic 30-Second Auto Sync to send user data and progress to backend database
  useEffect(() => {
    const syncInterval = setInterval(async () => {
      const currentUser = userRef.current;
      if (currentUser && currentUser.id) {
        try {
          const res = await syncUserApi(currentUser.id, currentUser);
          if (res && res.success && res.user) {
            setUser(prev => (prev ? { ...prev, energy: res.user.energy } : res.user));
          }
        } catch (err) {
          console.error('Periodic 30s auto sync error:', err);
        }
      }
    }, 30000); // 30 seconds

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && userRef.current && userRef.current.id) {
        syncUserApi(userRef.current.id, userRef.current);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(syncInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('nxb_user_id', updatedUser.id);
  };

  const handleAuthSuccess = (loggedUser: User) => {
    setUser(loggedUser);
    localStorage.setItem('nxb_user_id', loggedUser.id);
    setShowAuthModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1c1310] via-[#160d0a] to-[#110806] text-amber-50 font-sans relative overflow-x-hidden">
      {/* Background ambient lighting glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-72 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Constraints for Mobile Telegram Mini-App UI */}
      <div className="max-w-md mx-auto min-h-screen flex flex-col justify-between relative z-10 shadow-2xl bg-[#170e0b]/60 border-x border-[#38261e]/40">
        {/* Header */}
        <Header
          user={user}
          onOpenAuth={() => setShowAuthModal(true)}
          onOpenAdmin={() => setShowAdminModal(true)}
        />

        {/* Dynamic Body Tabs */}
        <main className="flex-1">
          {activeTab === 'game' && (
            <AirdropTapGame
              user={user}
              onUpdateUser={handleUserUpdate}
              onOpenAuth={() => setShowAuthModal(true)}
              onOpenUpgrades={() => setActiveTab('upgrades')}
            />
          )}

          {activeTab === 'task' && (
            <TaskList
              user={user}
              onUpdateUser={handleUserUpdate}
              onOpenAuth={() => setShowAuthModal(true)}
            />
          )}

          {activeTab === 'top' && <LeaderboardView />}

          {activeTab === 'upgrades' && (
            <UpgradesView
              user={user}
              onUpdateUser={handleUserUpdate}
              onOpenAuth={() => setShowAuthModal(true)}
            />
          )}

          {activeTab === 'friends' && (
            <ReferralView
              user={user}
              onOpenAuth={() => setShowAuthModal(true)}
            />
          )}
        </main>

        {/* Bottom Tab Navbar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
          initialReferralCode={urlRefCode}
        />
      )}

      {/* Admin Panel Modal */}
      {showAdminModal && (
        <AdminPanel onClose={() => setShowAdminModal(false)} />
      )}
    </div>
  );
}
