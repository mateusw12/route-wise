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