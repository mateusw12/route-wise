import Image from "next/image";
import Link from "next/link";

export default function DocumentacaoPage() {
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
            <h1 className="content-title">Documentacao</h1>
            <p className="content-subtitle">
              Guia rapido para configurar ambiente, executar e publicar o projeto.
            </p>
          </div>
        </header>

        <section className="content-section">
          <h2>1. Configuracao de ambiente</h2>
          <p>
            Copie o arquivo .env.example para .env.local e preencha as variaveis de
            autenticacao e roteamento.
          </p>
        </section>

        <section className="content-section">
          <h2>2. Rodar localmente</h2>
          <ul>
            <li>npm install</li>
            <li>npm run dev</li>
            <li>npm run lint</li>
            <li>npm run test:ci</li>
          </ul>
        </section>

        <section className="content-section">
          <h2>3. Pipeline e deploy</h2>
          <p>
            O CI valida lint, testes e build. O deploy para Vercel e disparado somente depois do
            CI verde na main.
          </p>
        </section>

        <section className="content-section">
          <h2>4. Estrutura funcional</h2>
          <ul>
            <li>app/api: endpoints internos de geocoding e routing</li>
            <li>components/map: mapa, camadas e dashboard</li>
            <li>components/search: busca, filtros e acoes</li>
            <li>libs/services e libs/dtos: acesso a dados e contratos tipados</li>
          </ul>
        </section>

        <div className="content-links">
          <Link href="/" className="content-link">
            Ir para o mapa
          </Link>
          <Link href="/sobre" className="content-link">
            Sobre o projeto
          </Link>
        </div>
      </section>
    </main>
  );
}
