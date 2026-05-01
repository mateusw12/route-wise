# RouteWise

Aplicacao web estilo GPS com Next.js 16, React 19, Leaflet, Nominatim, OpenRouteService e autenticacao Google com NextAuth.

## Requisitos

- Node.js 20+
- Chave da OpenRouteService
- Credenciais OAuth do Google

## Ambiente

1. Copie o arquivo de exemplo:

	cp .env.example .env.local

2. Preencha as variaveis:

- ORS_API_KEY
- NEXTAUTH_SECRET
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- NEXTAUTH_URL

## Executar

npm install
npm run dev

## Funcionalidades

- Mapa interativo com Leaflet
- Localizacao atual do usuario
- Busca de origem e destino com debounce
- Marcadores por clique no mapa
- Tracado de rota com polyline
- Exibicao de distancia e tempo estimado
- Autenticacao com Google

## Deploy Vercel com gate de CI

O projeto inclui workflow em [.github/workflows/vercel-deploy.yml](.github/workflows/vercel-deploy.yml) que so faz deploy quando o workflow [CI](.github/workflows/ci.yml) concluir com sucesso na branch main.

Configure os secrets no GitHub:

- VERCEL_TOKEN
- VERCEL_ORG_ID
- VERCEL_PROJECT_ID

Para garantir que somente esse workflow publique na Vercel:

1. Abra o projeto na Vercel.
2. Entre em Settings > Git.
3. Desative auto-deploy de push/PR (se estiver ligado).

Assim, o deploy de producao so acontece apos passar em lint, testes e build no GitHub Actions.