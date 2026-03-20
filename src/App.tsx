import { useEffect, useState, useCallback, useMemo } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc,
  orderBy,
  limit,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { 
  auth, 
  db, 
  signInWithGoogle, 
  handleFirestoreError, 
  OperationType 
} from './firebase';
import { UserProfile, CheckIn, Contact, BadgeMilestone, HealthStatus } from './types';
import { HeartPulse } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { isYesterday, isToday } from 'date-fns';

// Components
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { FamilyTab } from './components/FamilyTab';
import { UpdatesTab } from './components/UpdatesTab';
import { StatusTab } from './components/StatusTab';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [appUsers, setAppUsers] = useState<UserProfile[]>([]);
  const [notifications, setNotifications] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'family' | 'updates' | 'status'>('family');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [googleToken, setGoogleToken] = useState<string | null>(null);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await ensureUserProfile(currentUser);
      } else {
        setProfile(null);
        setContacts([]);
        setAppUsers([]);
        setNotifications([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Profile Listener
  useEffect(() => {
    if (!user) return;
    const path = `users/${user.uid}`;
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
      if (snapshot.exists()) {
        setProfile(snapshot.data() as UserProfile);
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, path));
    return () => unsubscribe();
  }, [user]);

  // Notifications Listener
  useEffect(() => {
    if (!user) return;
    const path = 'checkins';
    const q = query(
      collection(db, 'checkins'),
      where('receiverId', '==', user.uid),
      orderBy('timestamp', 'desc'),
      limit(50)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const checkins = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CheckIn));
      setNotifications(checkins);
    }, (error) => handleFirestoreError(error, OperationType.LIST, path));
    return () => unsubscribe();
  }, [user]);

  // Fetch Google Contacts
  const fetchContacts = useCallback(async (token: string) => {
    try {
      const response = await fetch(
        'https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,photos&pageSize=1000',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const data = await response.json();
      const connections = data.connections || [];
      const formattedContacts: Contact[] = connections.map((person: any) => ({
        name: person.names?.[0]?.displayName || 'Unknown',
        email: person.emailAddresses?.[0]?.value || '',
        photoURL: person.photos?.[0]?.url || ''
      })).filter((c: Contact) => c.email !== '');
      
      setContacts(formattedContacts);
      
      if (formattedContacts.length > 0) {
        const emails = formattedContacts.map(c => c.email);
        const batchSize = 30;
        const appUsersList: UserProfile[] = [];
        
        for (let i = 0; i < emails.length; i += batchSize) {
          const batch = emails.slice(i, i + batchSize);
          const q = query(collection(db, 'users'), where('email', 'in', batch));
          const snapshot = await getDocs(q);
          snapshot.docs.forEach(doc => {
            const data = doc.data() as UserProfile;
            if (data.uid !== user?.uid) {
              appUsersList.push(data);
            }
          });
        }
        setAppUsers(appUsersList);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  }, [user]);

  const ensureUserProfile = async (currentUser: User) => {
    const userRef = doc(db, 'users', currentUser.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      const newProfile: UserProfile = {
        uid: currentUser.uid,
        displayName: currentUser.displayName,
        email: currentUser.email || '',
        photoURL: currentUser.photoURL,
        streakCount: 0,
        lastActivityDate: null,
        badges: [],
        favorites: [],
        contacts: []
      };
      await setDoc(userRef, newProfile);
      setProfile(newProfile);
    } else {
      setProfile(userSnap.data() as UserProfile);
    }
  };

  const handleLogin = async () => {
    try {
      const { user: loggedInUser, token } = await signInWithGoogle();
      if (token) {
        setGoogleToken(token);
        fetchContacts(token);
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = () => auth.signOut();

  const sendCheckIn = async (receiver: UserProfile, status: HealthStatus = 'healthy') => {
    if (!user || !profile) return;
    
    try {
      let location = undefined;
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
        } catch (e) {
          console.warn('Geolocation failed or timed out:', e);
        }
      }

      await addDoc(collection(db, 'checkins'), {
        senderId: user.uid,
        senderName: profile.displayName || 'Patient',
        receiverId: receiver.uid,
        timestamp: serverTimestamp(),
        status: status,
        read: false,
        location: location
      });

      await updateStreak(user.uid);
      console.log(`Check-in sent to ${receiver.displayName}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'checkins');
    }
  };

  const updateStreak = async (uid: string) => {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return;
    
    const data = userSnap.data() as UserProfile;
    const lastDate = data.lastActivityDate?.toDate();
    
    let newStreak = data.streakCount || 0;
    
    if (!lastDate) {
      newStreak = 1;
    } else if (isToday(lastDate)) {
      return;
    } else if (isYesterday(lastDate)) {
      newStreak += 1;
    } else {
      newStreak = 1;
    }

    const newBadges = [...(data.badges || [])];
    if (newStreak >= 3 && !newBadges.includes(BadgeMilestone.STREAK_3)) newBadges.push(BadgeMilestone.STREAK_3);
    if (newStreak >= 7 && !newBadges.includes(BadgeMilestone.STREAK_7)) newBadges.push(BadgeMilestone.STREAK_7);
    if (newStreak >= 30 && !newBadges.includes(BadgeMilestone.STREAK_30)) newBadges.push(BadgeMilestone.STREAK_30);
    if (newStreak >= 100 && !newBadges.includes(BadgeMilestone.STREAK_100)) newBadges.push(BadgeMilestone.STREAK_100);

    await updateDoc(userRef, {
      streakCount: newStreak,
      lastActivityDate: serverTimestamp(),
      badges: newBadges
    });
  };

  const toggleFavorite = async (targetUid: string) => {
    if (!profile) return;
    const userRef = doc(db, 'users', profile.uid);
    const favorites = [...(profile.favorites || [])];
    const index = favorites.indexOf(targetUid);
    if (index > -1) {
      favorites.splice(index, 1);
    } else {
      favorites.push(targetUid);
    }
    await updateDoc(userRef, { favorites });
  };

  const sortedAppUsers = useMemo(() => {
    return [...appUsers].sort((a, b) => {
      const aFav = profile?.favorites?.includes(a.uid) ? 1 : 0;
      const bFav = profile?.favorites?.includes(b.uid) ? 1 : 0;
      return bFav - aFav;
    });
  }, [appUsers, profile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <motion.div 
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <HeartPulse className="w-12 h-12 text-blue-600" />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <ErrorBoundary>
      <Layout
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        streakCount={profile?.streakCount || 0}
        hasUnreadNotifications={notifications.some(n => !n.read)}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        onLogout={handleLogout}
        onSyncContacts={() => googleToken && fetchContacts(googleToken)}
      >
        <AnimatePresence mode="wait">
          {activeTab === 'family' && (
            <FamilyTab 
              key="family"
              users={sortedAppUsers}
              favorites={profile?.favorites || []}
              onToggleFavorite={toggleFavorite}
              onSendCheckIn={sendCheckIn}
              onSyncContacts={() => googleToken && fetchContacts(googleToken)}
            />
          )}
          {activeTab === 'updates' && (
            <UpdatesTab 
              key="updates"
              notifications={notifications}
            />
          )}
          {activeTab === 'status' && (
            <StatusTab 
              key="status"
              profile={profile}
            />
          )}
        </AnimatePresence>
      </Layout>
    </ErrorBoundary>
  );
}
