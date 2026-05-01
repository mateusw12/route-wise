"use client";

import Image from "next/image";
import { useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SignInPage() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/");
    }
  }, [router, status]);

  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Image
          src="/logo/logo.png"
          alt="Logo RouteWise"
          width={72}
          height={72}
          className="auth-logo"
          priority
        />
        <h1 className="auth-title">Bem-vindo ao RouteWise</h1>
        <p className="auth-subtitle">
          Faça login para acessar o mapa, criar rotas e salvar sua jornada.
        </p>

        <button
          type="button"
          className="auth-signin-btn"
          onClick={() => signIn("google", { callbackUrl })}
        >
          Entrar com Google
        </button>
      </section>
    </main>
  );
}
