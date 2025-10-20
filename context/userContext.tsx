import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "@/firebase/firebaseConfig";

interface Task {
  id: string;
  text: string;
  uid: string;
  createdAt?: any;
  status: boolean;
  deadline?: string | null;
  toastID: string;
  firstName: String;
  priority: String | null;
  reminder: String | null;
}

interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  address: string;
  email: string;
  uid: string;
}

interface UserContextType {
  user: any;
  tasks: Task[];
  profile: Profile[];
  fetchLoading: boolean;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  tasks: [],
  profile: [],
  fetchLoading: true,
  logout: async () => {},
});

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [profile, setProfile] = useState<Profile[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);

  const logout = async () => {
    await signOut(auth);
  };

  useEffect(() => {
    console.log("UserContext mounted");

    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setTasks([]);
        setProfile([]);
        setFetchLoading(false);
        return;
      }

      setUser(currentUser);

      // 👇 Fetch "tasks"
      const taskQuery = query(
        collection(db, "tasks"),
        where("uid", "==", currentUser.uid),
        orderBy("createdAt", "desc")
      );

      const unsubTasks = onSnapshot(taskQuery, (snapshot) => {
        const list: Task[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Task, "id">),
        }));
        setTasks(list);
        setFetchLoading(false);
      });

      // 👇 Fetch "profile"
      const profileQuery = query(
        collection(db, "profile"),
        where("uid", "==", currentUser.uid)
      );

      const unsubProfile = onSnapshot(profileQuery, (snapshot) => {
        const list: Profile[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Profile, "id">),
        }));
        setProfile(list);
        // setFetchLoading(false);
      });

      return () => {
        unsubTasks();
        unsubProfile();
      };
    });

    return () => unsubAuth();
  }, []);

  return (
    <UserContext.Provider
      value={{ user, tasks, profile, fetchLoading, logout }}
    >
      {children}
    </UserContext.Provider>
  );
};
