# SolydShop — Site Vision & Roadmap

## 1. Project Overview
Industrial B2B e-commerce platform for heavy machinery parts. Users browse products, add to cart, checkout with Stripe, and track orders. Sellers manage their product listings. Admins manage everything.

**Tech Stack:** React 19, Vite, Redux Toolkit, TailwindCSS 4, Spring Boot backend on localhost:8080

## 2. API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login → JWT cookie |
| POST | `/auth/register` | Register new user |
| POST | `/auth/logout` | Clear JWT cookies |
| GET | `/auth/me` | Get current user |
| POST | `/auth/forgot-password` | Send reset email |
| POST | `/auth/reset-password` | Reset password with token |
| GET | `/public/products` | Browse products (keyword, categoryId) |
| GET | `/public/categories` | List all categories |
| GET | `/cart/{userId}` | Get user cart |
| POST | `/cart/{userId}/items` | Add item to cart |
| DELETE | `/cart/{userId}/items/{productId}` | Remove item |
| GET | `/order/{userId}` | Get user orders |
| POST | `/payment/create-payment-intent` | Stripe payment intent |
| GET | `/seller/products` | Seller's products |
| POST | `/seller/products` | Create product |
| PUT | `/seller/products/{id}` | Update product |
| DELETE | `/seller/products/{id}` | Delete product |
| GET | `/admin/products` | All products (admin) |
| GET | `/admin/categories` | All categories |
| POST | `/admin/categories` | Create category |
| PUT | `/admin/categories/{id}` | Update category |
| DELETE | `/admin/categories/{id}` | Delete category |
| GET | `/admin/users` | All users |
| PUT | `/admin/users/{id}/role` | Change user role |
| DELETE | `/admin/users/{id}` | Delete user |
| GET | `/order/admin` | All orders (admin) |
| PUT | `/order/{id}/status` | Update order status |
| POST | `/upload` | Upload product image (Cloudinary) |

## 3. Stitch Project ID
<!-- Will be populated after first Stitch project creation -->

## 4. Sitemap
- [x] homepage — Featured products, filters, mini cart
- [x] login — Login form
- [ ] register — Registration form
- [ ] forgot-password — Request password reset
- [ ] reset-password — Set new password
- [ ] cart — Full cart page
- [ ] checkout — Stripe checkout flow
- [ ] orders — User order history
- [ ] seller-dashboard — Seller product management
- [ ] admin-dashboard — Analytics & KPIs
- [ ] admin-products — Product CRUD table
- [ ] admin-categories — Category management
- [ ] admin-orders — All orders management
- [ ] admin-users — User role management

## 5. Roadmap (Build Order)
1. homepage
2. login
3. register
4. cart
5. checkout
6. orders
7. seller-dashboard
8. admin-dashboard
9. admin-products
10. admin-categories
11. admin-orders
12. admin-users
13. forgot-password
14. reset-password
