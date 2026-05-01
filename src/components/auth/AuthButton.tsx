"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export function AuthButton() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <button type="button" className="auth-btn" onClick={() => signIn("google")}>
        Entrar com Google
      </button>
    );
  }

  return (
    <div className="auth-wrap">
      <span className="auth-user">{session.user?.name ?? "Usuario"}</span>
      <button type="button" className="auth-btn" onClick={() => signOut()}>
        Sair
      </button>
    </div>
  );
}
