# Doações PIX via Stripe

Este fluxo complementa o contrato on-chain em [`donations-contract.md`](./donations-contract.md). O frontend nunca recebe a **secret key** da Stripe; apenas chama a API do servidor hospedada no Cloud Run.

## Pré-requisitos na Stripe

1. Conta Stripe com sede no **Brasil** (ou capacidade de receber em **BRL**).
2. Ativar o método de pagamento **PIX** no [Dashboard → Settings → Payment methods](https://dashboard.stripe.com/settings/payment_methods).
3. Chaves de API em [Developers → API keys](https://dashboard.stripe.com/apikeys) (`sk_test_...` / `sk_live_...`).
4. Webhook apontando para `https://<seu-servico-cloud-run>/api/stripe/webhook` com o evento `checkout.session.completed`.

## Variáveis de ambiente

### Frontend (`.env` / build)

| Variável | Exemplo | Descrição |
|----------|---------|-----------|
| `VITE_STRIPE_CHECKOUT_API_URL` | `/api/stripe/create-checkout-session` | Cloud Run (mesma origem). No GitHub Pages use a URL absoluta do Cloud Run. |

### Servidor (Cloud Run / local)

| Variável | Exemplo | Descrição |
|----------|---------|-----------|
| `STRIPE_SECRET_KEY` | `sk_test_...` | Secret key da Stripe |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Assinatura do endpoint de webhook |
| `ALLOWED_ORIGINS` | `https://seu-projeto.run.app,https://usuario.github.io` | Origens permitidas (CORS + URLs de retorno) |
| `PORT` | `8080` | Porta HTTP (padrão 8080) |

## GitHub Actions (secrets)

Configure em **Settings → Secrets and variables → Actions**:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `ALLOWED_ORIGINS` — inclua a URL do Cloud Run **e** a URL do GitHub Pages (`https://<user>.github.io`), sem barra final.
- `STRIPE_CHECKOUT_API_URL` — URL absoluta usada no build do Pages, por exemplo `https://rick-morty-portal-xxxxx.run.app/api/stripe/create-checkout-session`.

## Desenvolvimento local

Terminal 1 — API:

```bash
cd server
pnpm install
STRIPE_SECRET_KEY=sk_test_... \
ALLOWED_ORIGINS=http://localhost:5173 \
pnpm dev
```

Terminal 2 — SPA (na raiz do repositório):

```bash
VITE_STRIPE_CHECKOUT_API_URL=http://localhost:8080/api/stripe/create-checkout-session pnpm dev
```

Webhook com Stripe CLI:

```bash
stripe listen --forward-to localhost:8080/api/stripe/webhook
```

Use o `whsec_...` exibido pelo CLI em `STRIPE_WEBHOOK_SECRET`.

## Valores aceitos

- Presets: **R$ 10**, **R$ 25**, **R$ 50**
- Custom: **R$ 5** a **R$ 500** (validado no cliente e no servidor)

## Fluxo resumido

1. Usuário escolhe valor na aba **PIX / Stripe** do modal de doações.
2. SPA envia `POST /api/stripe/create-checkout-session` com `amountCents`, `successUrl`, `cancelUrl` e `locale`.
3. Servidor cria `Checkout Session` com `payment_method_types: ['pix']` e `currency: brl`.
4. Navegador redireciona para a página hospedada da Stripe (QR PIX).
5. Após pagar ou cancelar, o usuário volta para o portal com `?donation=pix-success` ou `?donation=pix-cancelled`.

## IOF

A Stripe pode exibir IOF (~3,5%) no app bancário do pagador no Brasil. O portal mostra uma nota educativa; o comportamento exato segue a configuração da conta Stripe.
