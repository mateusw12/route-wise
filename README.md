# RouteWise

RouteWise e uma aplicacao web estilo GPS feita com Next.js 16, React 19, Leaflet, Nominatim, OpenRouteService e autenticacao Google com NextAuth.

Feita para ser simples, leve e facil de usar: voce escolhe origem e destino, e o app mostra a melhor rota com distancia e tempo estimado.

## Acesse o site

Use o RouteWise em producao aqui:

- https://route-wise-ivory.vercel.app/auth/signin

## Requisitos

- Node.js 20+
- Chave da OpenRouteService
- Credenciais OAuth do Google

## Configuracao do ambiente

1. Copie o arquivo de exemplo:

	cp .env.example .env.local

2. Preencha as variaveis no arquivo `.env.local`:

- ORS_API_KEY
- NEXTAUTH_SECRET
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- NEXTAUTH_URL

## Como executar localmente

```bash
npm install
npm run dev
```

## O que voce encontra no app

- Mapa interativo com Leaflet
- Localizacao atual do usuario
- Busca de origem e destino com debounce
- Marcadores por clique no mapa
- Tracado de rota com polyline
- Exibicao de distancia e tempo estimado
- Login com Google

## Deploy na Vercel com gate de CI

O projeto inclui workflow em [.github/workflows/vercel-deploy.yml](.github/workflows/vercel-deploy.yml) que so faz deploy quando o workflow [CI](.github/workflows/ci.yml) conclui com sucesso na branch `main`.

Configure os seguintes secrets no GitHub:

- VERCEL_TOKEN
- VERCEL_ORG_ID
- VERCEL_PROJECT_ID

Para garantir que somente esse workflow publique na Vercel:

1. Abra o projeto na Vercel.
2. Acesse Settings > Git.
3. Desative auto-deploy de push/PR (se estiver ligado).

Assim, o deploy de producao acontece apenas depois de passar por lint, testes e build no GitHub Actions.