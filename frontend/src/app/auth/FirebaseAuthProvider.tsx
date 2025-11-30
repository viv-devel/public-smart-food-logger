// src/app/fitbit-via-gemini/auth/FirebaseAuthProvider.tsx
"use client";

import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { app } from "./firebaseConfig";

interface FirebaseAuthContextType {
  user: User | null;
  loading: boolean;
  idToken: string | null;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType | undefined>(
  undefined,
);

export function FirebaseAuthProvider({ children }: { children: ReactNode }) {
  const isMockAuth = process.env.NEXT_PUBLIC_MOCK_AUTH === "true";

  const [user, setUser] = useState<User | null>(() => {
    if (isMockAuth) {
      console.log("Mock auth enabled. Mocking Firebase Auth user.");
      return {
        uid: "mock-test-uid",
        isAnonymous: true,
        providerData: [],
        email: null,
        emailVerified: false,
        phoneNumber: null,
        photoURL: null,
        displayName: "Mock Test User",
        tenantId: null,
        getIdToken: async () => "dummy-id-token-for-mock",
        getIdTokenResult: async () => ({
          token: "dummy-id-token-for-mock",
          expirationTime: new Date(Date.now() + 3600 * 1000).toISOString(),
          authTime: new Date().toISOString(),
          issuedAtTime: new Date().toISOString(),
          signInProvider: "anonymous",
          signInSecondFactor: null,
          claims: {},
        }),
        reload: async () => {},
        delete: async () => {},
        toJSON: () => ({}),
        providerId: "firebase",
        metadata: {} as never,
        refreshToken: "",
      };
    }
    return null;
  });
  const [loading, setLoading] = useState(() => !isMockAuth);
  const [idToken, setIdToken] = useState<string | null>(() => {
    if (isMockAuth) {
      console.log("Mock auth enabled. Mocking Firebase Auth token.");
      return "dummy-id-token-for-mock";
    }
    return null;
  });

  useEffect(() => {
    // モック認証が有効な場合の処理
    if (isMockAuth) {
      return; // 実際のFirebaseリスナーを登録しない
    }

    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        setUser(currentUser);
        const token = await currentUser.getIdToken();
        setIdToken(token);
      } else {
        // ユーザーがいない場合は匿名でサインインするロジックは削除されました。
        // 匿名認証はユーザーの明示的なアクションによってのみ行われます。
        setUser(null);
        setIdToken(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isMockAuth]);

  // トークンを定期的にリフレッシュするためのタイマー
  useEffect(() => {
    const interval = setInterval(
      async () => {
        const auth = getAuth(app);
        if (auth.currentUser) {
          try {
            const token = await auth.currentUser.getIdToken(true); // trueで強制リフレッシュ
            setIdToken(token);
          } catch (error) {
            console.error("Error refreshing ID token:", error);
          }
        }
      },
      30 * 60 * 1000,
    ); // 30分ごとにリフレッシュ

    return () => clearInterval(interval);
  }, []);

  return (
    <FirebaseAuthContext.Provider value={{ user, loading, idToken }}>
      {children}
    </FirebaseAuthContext.Provider>
  );
}

export function useFirebaseAuth() {
  const context = useContext(FirebaseAuthContext);
  if (context === undefined) {
    throw new Error(
      "useFirebaseAuth must be used within a FirebaseAuthProvider",
    );
  }
  return context;
}
