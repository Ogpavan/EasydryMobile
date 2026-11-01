# EasyDry Laundrys

A complete mobile-first React customer application with 21 core screens, a Material UI design system, and a working pickup-first demo journey. It runs locally; no cloud deployment or real service integration is required.

## Run

Requires Node.js 22.12+ (Node 24 recommended) and npm.

```bash
npm install
npm run dev
```

Open **http://localhost:5173**. A fresh browser opens splash → onboarding → sign-in. Enter any valid Indian mobile number (10 digits, starting with 6–9), then use demo OTP **123456**. OTP expires after five minutes; resend is available after 30 seconds. No SMS is sent.

```bash
npm run build        # TypeScript validation and optimized production build
npm run preview      # Serve the production build
npm run lint         # ESLint and React hooks checks
npm test             # Domain and financial consistency tests
npm run test:e2e     # Chromium customer journeys and responsive checks
npm run format       # Format source and configuration
```

For browser tests, run `npx playwright install chromium` once. Set `CHROMIUM_PATH` only if you need to use an existing Chromium installation. Playwright starts the development server automatically, or reuses an existing one. Screenshots are written to `artifacts/`; failures are saved to `test-results/`.

## Try the complete journey

1. Complete onboarding and sign in with the demo OTP.
2. Choose one or more services, a future day, an available pickup slot, and a saved or new address. An express option adds ₹99 to the eventual assessed invoice.
3. Confirm the pickup. This creates a **pickup request only**. There is no garment cart and no automatic invoice.
4. Open the request to reschedule, cancel, or select **Simulate pickup & assessment**. This explicit demo control marks collection and creates a separate itemized order. Repeating assessment cannot create duplicate orders.
5. Review the invoice. Apply an eligible coupon, then optionally redeem package credit. The remaining amount can be settled through the demo checkout.
6. Try a payment decline using the checkout checkbox. A failed payment records an attempt and leaves the invoice unpaid. Retry to record a successful demo payment.
7. Open tracking and use the labeled demo journey controls to advance through cleaning, packing and delivery. Delivery requires a settled invoice. Rate the delivered order and book again.
8. Explore prepaid plans, coupon eligibility, profile and address editing, preferences, support tickets, payment history, and logout.

A sample scheduled request, an assessed order in progress, and a delivered order are seeded so every main area is immediately useful. They are example data and do not represent actual customers or orders.

## Screen map

| #   | Screen                        | Route                          |
| --- | ----------------------------- | ------------------------------ |
| 01  | Splash                        | `/`                            |
| 02  | Three-slide onboarding        | `/onboarding`                  |
| 03  | Login / sign up               | `/login`                       |
| 04  | OTP verification              | `/verify` (entered from login) |
| 05  | Home                          | `/home`                        |
| 06  | Select services               | `/booking/services`            |
| 07  | Schedule pickup               | `/booking/schedule`            |
| 08  | Pickup address                | `/booking/address`             |
| 09  | Pickup confirmation           | `/booking/confirmed/:id`       |
| 10  | My requests                   | `/requests`                    |
| 11  | Reschedule pickup             | `/requests/:id/reschedule`     |
| 12  | Cancel pickup                 | `/requests/:id/cancel`         |
| 13  | My orders                     | `/orders`                      |
| 14  | Order tracking                | `/orders/:id/tracking`         |
| 15  | Order details + payment sheet | `/orders/:id`                  |
| 16  | Delivered + rating            | `/orders/:id/delivered`        |
| 17  | Laundry packages              | `/packages`                    |
| 18  | Offers and coupons            | `/offers`                      |
| 19  | Profile                       | `/account`                     |
| 20  | Help and support              | `/support`                     |
| 21  | Settings                      | `/settings`                    |

Additional functional routes: request detail, saved addresses, notification feed, payment activity, and legal notices. Requests and orders require authentication. Focused booking and detail flows hide bottom navigation; Home, Requests, Orders and Account retain it.

## Architecture

- `src/app`: theme, router and provider setup.
- `src/components`: shared controls, cards, forms, feedback and navigation.
- `src/features`: auth, home, booking, request management, orders, checkout, plans, offers, account, support and settings.
- `src/layouts`: responsive shell and flow layouts.
- `src/store/appStore.ts`: typed Zustand store, persisted using the `easydry-demo-v1` LocalStorage key. Business mutations enforce invoice, payment and credit invariants.
- `src/services`: asynchronous mock API boundary, OTP, booking, payments, service catalog, assessment and price calculations. These boundaries can later call a real backend.
- `src/types`, `src/utils`, `src/hooks`: domain interfaces, formatting and async state.
- `src/styles/global.css`: centralized CSS variables, responsive styling and safe-area behavior; MUI tokens live in `src/app/theme.ts`.
- `tests`: domain regression tests and browser journeys across 360, 390, 412 and 430px.

The default language is English. Notifications are a functional in-app feed with persisted preferences; no push provider is connected. The short-lived mock OTP challenge is kept in SessionStorage so refreshing the verification page does not invalidate it. No secret OTP is stored; the code `123456` is public demo behavior. OTP entry supports normal typing, paste, and six-digit autofill. If you need help entering it, select **Fill demo code** and then **Verify & continue**. This action also refreshes the demo challenge.

## Pricing and payment rules

All prices, offers, plan values and fulfilment are demo values. The quantity and unit prices are generated only during explicit simulated assessment. Express fees are included in the assessed invoice. Coupon expiry, minimum invoice, maximum savings, and paid status are checked centrally. Only one coupon applies per invoice. Apply coupons **before** redeeming credit. Credit redemption is atomic, never exceeds the outstanding total, and cannot make the package balance negative. Full credit settlement marks an invoice paid. Partial credit leaves the remaining balance payable. Successful payments cannot be repeated. Plan recharges add credit to the existing balance.

Payment options are UPI, credit/debit card, and net banking. The checkout never collects financial credentials, invokes a payment network or charges money. Support tickets are saved locally and are not sent to a team.

## Branding and illustrations

The supplied EasyDry logo is used by the web application. This repository contains the customer-facing web application; the separate Android WebView wrapper is excluded. Verified company contact details and official legal documents were not supplied. Demo legal notices explain application behavior and are explicitly not presented as official company policies. The WhatsApp entry explains that a verified number is not configured; no contact number is invented.

Project-owned 3D laundry artwork is in `src/assets/illustrations/`, generated using the built-in imagegen tool. The source PNGs retain transparency. `ASSETS.md` documents prompts and asset roles. Flat Lucide icons are used for controls and system navigation.

## Persistence and backend integration

Demo records persist in this browser. Logging out clears authentication and the current booking draft, retaining the demo history. Browser storage is not a secure production data store and this demo does not implement server authorization, payment verification or real operations. To reset the demonstration, clear this site's LocalStorage key (`easydry-demo-v1`) in your browser's developer tools.

Before a real launch, replace the mock service calls with authenticated server endpoints, verify payments server-side, source actual pricing and company policies, configure verified support channels, and have the original brand assets reviewed. For static hosting, configure history fallback to `index.html` for React Router deep links. Build output is `dist/`.

## Verification

Verified in Chromium:

- 11 passing domain tests covering pickup-first creation, assessment idempotency, address snapshots, eligibility, cancellation, payment failure and retry, coupon rules, package redemption and delivery gating.
- 9 passing browser tests covering OTP typing, invalid-code recovery, autofill, paste, refresh, the complete booking-to-delivery journey, plans, profile, addresses, support, preferences and logout.
- All main routes checked for viewport and content overflow at 360px, 390px, 412px and 430px, including a newly confirmed booking at each width.
- Production-build smoke check covering demo-code login, desktop home and lazy-loaded invoice, tracking, plans, support and settings. No runtime errors.
- `npm run lint`, `npm test` and `npm run build` pass.

The in-app browser connection was unavailable during implementation; browser checks used automated local Chromium. Screenshots are saved in `artifacts/`.

## Color roles

The curated palette is centralized in `src/app/colors.ts`, shared with MUI and exposed as CSS variables. `src/styles/color-system.css` applies the color roles across features:

- Neutral canvas and white surfaces establish the base. Blue remains the primary action and selection color.
- Service artwork uses muted mint (Wash & Fold), cool blue (Wash & Iron), lavender (Dry Cleaning), and warm sand (Shoe Care).
- Warm gold identifies savings, coupons and express attention. Navy and deep teal distinguish plans and prepaid balances.
- Status labels and tracking share stage colors: scheduled blue, processing amber, ready teal, out for delivery violet, completed green and cancelled red.
- Account and support use neutral icons with small contextual accents, avoiding repeated blue containers.

## Test on a phone over a hotspot

Connect the computer to the phone's hotspot, then run:

```bash
npm run build
npm run preview
```

Open the printed **Network** URL in the phone's browser, using `http://` and port `5173`. Keep the computer connected and the preview process running. Stop any existing dev server on the same port before starting preview. The optimized ES2019 build avoids development-client and hot-reload traffic during mobile testing. Record IDs use `crypto.getRandomValues`, which works on local-network HTTP; they do not depend on secure-context-only `randomUUID`. An initial HTML loading screen and startup-error message prevent silent blank output if an app script fails to load.
