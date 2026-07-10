"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AuthProvider, useAuth } from "@/lib/auth";
import { LoginScreen } from "./login-screen";
import { GuardianApp } from "./guardian-app";
import { LogoMark } from "./logo";

function Gate() {
  const { user, ready } = useAuth();

  if (!ready) {
    // Brief splash while the persisted session is read — avoids a login flash.
    return (
      <div className="flex min-h-screen items-center justify-center">
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <LogoMark size={40} />
        </motion.div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {user ? (
        <motion.div
          key="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <GuardianApp />
        </motion.div>
      ) : (
        <motion.div key="login" exit={{ opacity: 0 }}>
          <LoginScreen />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function AuthGate() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}
