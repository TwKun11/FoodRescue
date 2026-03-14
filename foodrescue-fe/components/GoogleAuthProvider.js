"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { getGoogleClientId } from "@/lib/runtime-config";

export default function GoogleAuthProvider({ children }) {
  const googleClientId = getGoogleClientId();

  if (!googleClientId) {
    return <>{children}</>;
  }
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      {children}
    </GoogleOAuthProvider>
  );
}
