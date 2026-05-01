import Image from "next/image";
import Link from "next/link";

export default function SobrePage() {
  return (
    <main className="content-page">
      <section className="content-card">
        <header className="content-head">
          <Image
            src="/logo/logo.png"
            alt="Logo RouteWise"
            width={52}
            height={52}
            className="content-logo"
            priority
          />
          <div>
            <h1 className="content-title">Sobre o RouteWise</h1>
            <p className="content-subtitle">
              Plataforma web para navegacao inteligente com foco em simplicidade e clareza.
            </p>
          </div>
        </header>

        <section className="content-section">
          <h2>O que e</h2>
          <p>
            O RouteWise e um app de mapas com busca de enderecos, criacao de rotas, suporte a
            paradas intermediarias e marcacao manual de pontos no mapa.
          </p>
        </section>

        <section className="content-section">
          <h2>Tecnologias</h2>
          <ul>
            <li>Next.js 16 + React 19 + TypeScript</li>
            <li>Leaflet / React-Leaflet para renderizacao de mapa</li>
            <li>Nominatim para geocoding</li>
            <li>OpenRouteService para roteamento</li>
            <li>NextAuth para autenticacao com Google</li>
          </ul>
        </section>

        <section className="content-section">
          <h2>Objetivo do produto</h2>
          <p>
            Entregar uma experiencia de roteamento direta para uso diario, com interface amigavel
            e foco em desempenho para desktop e mobile.
          </p>
        </section>

        <div className="content-links">
          <Link href="/" className="content-link">
            Ir para o mapa
          </Link>
          <Link href="/documentacao" className="content-link">
            Ver documentacao
          </Link>
        </div>
      </section>
    </main>
  );
}
