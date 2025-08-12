# Trendora Pages Documentation

This document describes each user-facing page in the Trendora (Namaste.dev) Next.js App Router project. Pages are grouped by feature area and mapped to their file paths under src/app.

Notes
- Public indicates accessible without login. Role indicates likely role constraints inferred from code structure. Enforce with RoleProtected and server checks.
- Dynamic segments are shown in [brackets].

============================================================
Home and Global
============================================================

/ (Home)
- File: src/app/page.js
- Purpose: Hero-driven landing experience. Highlights brand carousel, featured videos, testimonials, quiz promo, and services.
- Components: Hero, ScrollingCards, BrandCarousel, FeaturedVideos, TestimonialsSection, QuizPromo, ServicesSection
- Special behavior: Supports ?scroll=feedback to auto-scroll to a feedback section.
- Access: Public

/onboarding
- File: src/app/onboarding/page.js
- Purpose: Entry point to onboarding flow for new users to set preferences or profile basics.
- Access: Logged-in user recommended

/unauthorized
- File: src/app/unauthorized/page.jsx
- Purpose: Displayed when a user lacks permission to access a protected area (e.g., dashboards).
- Access: Public

Layout
- File: src/app/layout.js
- Role: Global layout. Injects Google Analytics (G-WYETEKYVWR), Razorpay script, shared header/footer. Exposes a floating “Zyra” chatbot button across pages. Uses a lighter layout for FashionTV routes for immersion.

============================================================
Authentication
============================================================

/auth/login
- File: src/app/auth/login/page.jsx
- Purpose: Sign-in UI; integrates with Firebase/Clerk hooks.
- Access: Public (gated redirect for authenticated users)

/auth/signup
- File: src/app/auth/signup/page.jsx
- Purpose: Registration UI for new users.
- Access: Public

/auth/verify
- File: src/app/auth/verify/page.jsx
- Purpose: Verify email or OTP; handles deep links from magic links.
- Access: Public (linked from email)

/auth/reset-password
- File: src/app/auth/reset-password/page.jsx
- Purpose: Password reset flow screen.
- Access: Public (via secure link)

/auth/action
- File: src/app/auth/action/page.jsx
- Purpose: Interstitial for auth actions (e.g., email verification confirmation, continue buttons).
- Access: Public

============================================================
Avatars
============================================================

/avatars
- File: src/app/avatars/page.jsx
- Purpose: Hub for avatar features (view/select/create).
- Access: Logged-in user recommended

/avatars/custom-avatar-builder
- File: src/app/avatars/custom-avatar-builder/page.jsx
- Purpose: 3D/Ready Player Me style avatar builder; generate a customized avatar.
- Access: Logged-in user

/avatars/select
- File: src/app/avatars/select/page.jsx
- Purpose: Choose a preset avatar from curated options.
- Access: Logged-in user

/avatars/upload
- File: src/app/avatars/upload/page.jsx
- Purpose: Upload a custom avatar image or asset.
- Access: Logged-in user

============================================================
Blog
============================================================

/blog
- File: src/app/blog/page.jsx
- Purpose: Blog index listing with search/pagination components.
- Access: Public

/blog/[slug]
- Files: src/app/blog/[slug]/page.jsx (primary), legacy src/app/blog/[slug].jsx
- Purpose: Blog details page by slug showing article content, author, and tags.
- Access: Public

============================================================
Chatbot and AI
============================================================

/chatbot
- File: src/app/chatbot/page.jsx
- Purpose: Zyra — AI Fashion Advisor. Chat-based guidance on outfits, looks, and products; can leverage visual inputs.
- Access: Public (best with account for personalization)
- Global entry: Floating chatbot button appears on most pages via RootLayout.

/virtual-tryon
- File: src/app/virtual-tryon/page.jsx
- Purpose: Client-side virtual try-on experience (components/VirtualTryOn). Try styles and see fit visuals.
- Access: Public

============================================================
Marketplace and Checkout
============================================================

/marketplace
- File: src/app/marketplace/page.jsx
- Purpose: Product discovery page with filters (category, merchant) and sorting (price/name/newest). Fetches data via /api/marketplace.
- Access: Public

/marketplace/product/[id]
- File: src/app/marketplace/product/[id]/page.jsx
- Purpose: Product details page with images, price, stock, add-to-cart, and buy/checkout actions.
- Access: Public

/checkout
- File: src/app/checkout/page.jsx
- Purpose: Single-page checkout flow with shipping details, shipping rates (Shiprocket), and payment (Razorpay). Includes payment verification callback handling.
- Access: Logged-in user recommended

============================================================
Consultation
============================================================

/consultation
- File: src/app/consultation/page.jsx
- Purpose: List or showcase fashion consultations/services and availability.
- Access: Public

/consultation/[id]/book
- File: src/app/consultation/[id]/book/page.jsx
- Purpose: Booking page for a specific consultation including calendar/time selection.
- Access: Logged-in user

============================================================
Dashboards — Merchant
============================================================

/merchant-dashboard (Index)
- File: src/app/merchant-dashboard/page.jsx
- Layout: src/app/merchant-dashboard/layout.jsx
- Purpose: Overview metrics and quick links to orders, products, payments, analytics, settings, and chat.
- Role: Merchant

/merchant-dashboard/orders
- File: src/app/merchant-dashboard/orders/page.jsx
- Purpose: List and manage orders. Pulls from Shiprocket via /api/merchant/orders and /api/merchant/shiprocket/orders.
- Role: Merchant

/merchant-dashboard/products
- File: src/app/merchant-dashboard/products/page.jsx
- Purpose: Manage product catalog (create, update, stock). Integrates with Firestore and Shiprocket product sync.
- Role: Merchant

/merchant-dashboard/payments
- File: src/app/merchant-dashboard/payments/page.jsx
- Purpose: View Razorpay orders/payments and settlement status. Uses /api/razorpay/payments.
- Role: Merchant

/merchant-dashboard/analytics
- File: src/app/merchant-dashboard/analytics/page.jsx
- Purpose: Sales KPIs, charts, cohorts, conversion metrics.
- Role: Merchant

/merchant-dashboard/settings
- File: src/app/merchant-dashboard/settings/page.jsx
- Purpose: Configure business details, pickup locations, shipping preferences; integrates /api/merchant/shiprocket/*.
- Role: Merchant

/merchant-dashboard/chat
- File: src/app/merchant-dashboard/chat/page.jsx
- Purpose: Merchant-customer chat center (Socket.io) for order queries and support.
- Role: Merchant

============================================================
Dashboards — Fashion Creator
============================================================

/fashion-creator-dashboard (Index)
- File: src/app/fashion-creator-dashboard/page.jsx
- Layout: src/app/fashion-creator-dashboard/layout.jsx
- Purpose: High-level overview of commissions, recent orders, portfolio performance.
- Role: Fashion Creator

/fashion-creator-dashboard/orders
- File: src/app/fashion-creator-dashboard/orders/page.jsx
- Purpose: Orders mapped to creator commissions using /api/fashion-creator/orders. Shows commission amounts/status.
- Role: Fashion Creator

/fashion-creator-dashboard/analytics
- File: src/app/fashion-creator-dashboard/analytics/page.jsx
- Purpose: Engagement analytics and growth metrics for creator content.
- Role: Fashion Creator

/fashion-creator-dashboard/payments
- File: src/app/fashion-creator-dashboard/payments/page.jsx
- Purpose: Payouts/earnings, withdrawal options, history.
- Role: Fashion Creator

/fashion-creator-dashboard/products
- File: src/app/fashion-creator-dashboard/products/page.jsx
- Purpose: Manage products tied to the creator (drops, collabs).
- Role: Fashion Creator

/fashion-creator-dashboard/portfolio
- File: src/app/fashion-creator-dashboard/portfolio/page.jsx
- Purpose: Manage looks/portfolio entries; organize, publish to social feed.
- Role: Fashion Creator

/fashion-creator-dashboard/settings
- File: src/app/fashion-creator-dashboard/settings/page.jsx
- Purpose: Personal/settings including Google Calendar connect. Redirect target for OAuth success/failure.
- Role: Fashion Creator

/fashion-creator-dashboard/events
- File: src/app/fashion-creator-dashboard/events/page.jsx
- Purpose: Calendar/events view; fetches Google events after auth at /api/auth/google/callback.
- Role: Fashion Creator

============================================================
Admin
============================================================

/admin-dashboard
- File: src/app/admin-dashboard/page.jsx
- Purpose: Administrative overview of platform metrics.
- Role: Admin

/admin/users
- File: src/app/admin/users/page.jsx
- Purpose: View/manage users; roles, status, moderation.
- Role: Admin

/admin/analytics
- File: src/app/admin/analytics/page.jsx
- Purpose: Global analytics, traffic, conversions, content health.
- Role: Admin

============================================================
Social Hub (Looks, Reels, Live)
============================================================

/social (Hub)
- File: src/app/social/page.js
- Purpose: Aggregated social feed for trending looks, reels (videos), and live streams. Quick actions and curated sections.
- Access: Public

/social/trending
- File: src/app/social/trending/page.jsx
- Purpose: Trending content list sourced from Firestore via /api/trending-content. Mixes looks and reels.
- Access: Public

/social/search
- File: src/app/social/search/page.jsx
- Purpose: Discovery and search across looks, users, and videos.
- Access: Public

/social/look (Index)
- File: src/app/social/look/page.jsx
- Purpose: Looks index and upload entry point.
- Access: Logged-in user to upload

/social/look/[id]
- File: src/app/social/look/[id]/page.jsx
- Purpose: Look details page; images, caption, tags, likes/comments.
- Access: Public

/social/look/upload
- File: src/app/social/look/upload/page.jsx
- Purpose: Upload new look with media and tags.
- Access: Logged-in user

/social/look/edit/[id]
- File: src/app/social/look/edit/[id]/page.jsx
- Purpose: Edit an existing look (owner-only).
- Access: Logged-in user (owner)

/social/user/[username]
- File: src/app/social/user/[username]/page.jsx
- Purpose: Public profile of a social user showing looks/reels and bio.
- Access: Public

/social/profile (Hub)
- File: src/app/social/profile/page.jsx
- Purpose: Social profile dashboard for the logged-in user with tabs to About, Activity, Liked, Looks, Reels.
- Access: Logged-in user

/social/profile/about
- File: src/app/social/profile/about/page.jsx
- Purpose: About tab — bio, social links, stats.
- Access: Logged-in user

/social/profile/activity
- File: src/app/social/profile/activity/page.jsx
- Purpose: Activity feed — posts, likes, comments by the user.
- Access: Logged-in user

/social/profile/liked
- File: src/app/social/profile/liked/page.jsx
- Purpose: Items the user has liked.
- Access: Logged-in user

/social/profile/looks
- File: src/app/social/profile/looks/page.jsx
- Purpose: Grid/list of the user’s looks with manage actions.
- Access: Logged-in user

/social/profile/reels
- File: src/app/social/profile/reels/page.jsx
- Purpose: Grid/list of the user’s reels.
- Access: Logged-in user

/social/fashiontv
- File: src/app/social/fashiontv/page.jsx
- Purpose: Video hub featuring Fashion TV content; browsing and playback.
- Access: Public

/social/fashiontv/live
- File: src/app/social/fashiontv/live/page.jsx
- Purpose: Live streaming lobby or listing of active/live channels.
- Access: Public

/social/fashiontv/live/[id]
- File: src/app/social/fashiontv/live/[id]/page.jsx
- Purpose: Specific live session page (player, chat, reactions). Likely integrates LiveKit.
- Access: Public (chat may require login)

/social/fashiontv/upload
- File: src/app/social/fashiontv/upload/page.jsx
- Purpose: Upload a Fashion TV video (title, tags, thumbnail, video source).
- Access: Logged-in user (creator)

============================================================
Profile
============================================================

/profile (Hub)
- File: src/app/profile/page.jsx
- Purpose: Personal profile hub with tabs for orders, blogs, activity, liked content.
- Access: Logged-in user

/profile/activity
- File: src/app/profile/activity/page.jsx
- Purpose: Timeline of user actions across the platform.
- Access: Logged-in user

/profile/blogs
- File: src/app/profile/blogs/page.jsx
- Purpose: User-authored blog list and management.
- Access: Logged-in user

/profile/liked
- File: src/app/profile/liked/page.jsx
- Purpose: Aggregated likes by the user across looks/reels/products.
- Access: Logged-in user

/profile/orders
- File: src/app/profile/orders/page.jsx
- Purpose: Purchases and order history; links to order detail and support.
- Access: Logged-in user

============================================================
Quizzes
============================================================

/quiz (Hub)
- File: src/app/quiz/page.jsx
- Purpose: Quiz discovery and entry point.
- Access: Public

/quiz/create
- File: src/app/quiz/create/page.jsx
- Purpose: Create a new quiz (questions, options, scoring rules).
- Access: Logged-in user (creator)

/quiz/play/[quiz_id]
- File: src/app/quiz/play/[quiz_id]/page.jsx
- Purpose: Play a quiz. Presents questions and records responses.
- Access: Public (login may be required to persist)

/quiz/play/[quiz_id]/leaderboard
- File: src/app/quiz/play/[quiz_id]/leaderboard/page.jsx
- Purpose: Leaderboard for a given quiz.
- Access: Public

/quiz/results/[response_id]
- File: src/app/quiz/results/[response_id]/page.jsx
- Purpose: Results screen for a user’s quiz attempt.
- Access: Logged-in user recommended

============================================================
Other Notable Pages
============================================================

/admin-dashboard, /admin/users, /admin/analytics
- Admin pages for overseeing the platform. See Admin section above.

============================================================
Maintenance
============================================================
- Keep this file updated as new pages are added under src/app/**.
- For pages with important parameters or complex flows, add a short “How it works” snippet under their description.
