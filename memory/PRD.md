# VOKZO - Trusted Local Services MVP

## Original Problem Statement
Build a production-ready MVP website named "VOKZO – Trusted Local Services" - a clean, scalable marketplace MVP for India focused on trust-first local services. Mobile-first, investor-demo ready.

## User Personas
1. **Customer**: Seeks local services (plumber, electrician, etc.) - can browse, book, review
2. **Provider**: Service professional - can register, accept bookings, manage earnings
3. **Admin**: Platform manager - approves providers, manages services, views analytics

## Core Requirements
- Role-based authentication (Customer/Provider/Admin)
- Service categories with sub-services
- City/location selection (20+ locations)
- Booking system with status tracking
- Provider dashboard with earnings
- Admin panel with analytics

## What's Been Implemented (Jan 2026)

### Backend (FastAPI + MongoDB)
- JWT-based authentication
- User, Provider, Booking, Review models
- Service categories and sub-services seeding
- Admin approval workflow
- Commission calculation (15% default)
- Cities/villages data for India

### Frontend (React + TailwindCSS + ShadcnUI)
- Homepage with hero, categories, how it works
- Login/Signup pages with role selection
- Provider registration with category selection
- Category browsing and provider listing
- Booking flow with date/time/address
- Customer booking history
- Provider dashboard with accept/reject/complete
- Admin dashboard with providers, bookings, services management

### Design
- Deep Blue (#1E3A8A) primary + Orange (#F97316) accent
- Poppins headings + Inter body fonts
- Mobile-first responsive design
- Card-based UI with rounded corners

## Admin Credentials
- Email: memonaynul2403@gmail.com
- Password: aynul2226@

## Prioritized Backlog

### P0 (Critical - Done)
- [x] Auth system
- [x] Service categories
- [x] Provider registration
- [x] Booking system
- [x] Admin panel

### P1 (High Priority)
- [ ] Provider reviews/ratings improvement
- [ ] Search functionality
- [ ] Booking notifications

### P2 (Medium Priority)
- [ ] Provider availability calendar
- [ ] Customer saved addresses
- [ ] Multi-language support

### P3 (Nice to Have)
- [ ] Live chat support
- [ ] Payment integration
- [ ] Push notifications

## Next Tasks
1. Add notification system for booking updates
2. Implement search with filters
3. Add provider portfolio/gallery
4. Integrate payment gateway (Razorpay/Stripe)
