# PHASE 1 AUDIT REPORT — SolydShop Redesign

Audit method: Systematic root-cause tracing. Every finding below is verified directly from the code, not inferred.

---

## Task 1 — Wire price range slider to API

**Status: NOT STARTED**

### Evidence

**Frontend — `HomePage.jsx`**

State declaration exists (line 64):
```js
const [priceMax, setPriceMax] = useState(50000);
```

Slider renders and correctly updates state (lines 297–303):
```jsx
<input type="range" min={0} max={100000} value={priceMax}
  onChange={(e) => setPriceMax(e.target.value)} ... />
```

But `fetchProducts()` signature (lines 82–95) accepts only `kw` and `catId` — `priceMax` is never passed:
```js
const fetchProducts = async (kw = keyword, catId = categoryId) => {
    let url = "/public/products?";
    if (kw.trim()) url += `keyword=${kw}&`;
    if (catId)     url += `categoryId=${catId}`;
    // priceMax is never referenced here
```

Debounce effect (lines 113–116) only watches `[keyword, categoryId]`:
```js
useEffect(() => {
    const t = setTimeout(() => fetchProducts(), 400);
    return () => clearTimeout(t);
}, [keyword, categoryId]);  // priceMax missing
```

"Apply Filters" button (line 346) calls `fetchProducts()` with no args — `priceMax` ignored.

`handleReset()` resets `priceMax` to 50000 but never sends it anywhere.

**Backend — `ProductController.java`**

`GET /api/public/products` accepts (lines 43–86):
- `pageNumber`, `pageSize`, `sortBy`, `sortOrder`, `keyword`, `categoryId`
- **No `maxPrice`, `minPrice`, or price filter param exists**

### Root Cause

Two-layer gap. Frontend doesn't pass the value; backend has no parameter to receive it. Both layers require new code.

### Missing Components

**Backend:**
- `ProductController.getAllProducts()` — needs `@RequestParam(required = false) Double maxPrice`
- `ProductServiceImpl.getAllProducts()` — needs price predicate in query
- `ProductRepository` — likely needs a JPA Specification or `@Query` for price range

**Frontend:**
- `fetchProducts()` — needs `priceMax` parameter in signature and URL construction
- Debounce `useEffect` — needs `priceMax` in dependency array
- "Apply Filters" button — needs to pass current `priceMax`

---

## Task 2 — Fix cart item images

**Status: NOT STARTED (affects two frontend components + backend DTO)**

### Evidence

**Frontend — `CartPage.jsx` (lines 279–283)**
```jsx
<Avatar variant="rounded" sx={{ width: 64, height: 64, bgcolor: "grey.100" }}>
    <InventoryOutlinedIcon sx={{ color: "text.disabled", fontSize: 28 }} />
</Avatar>
```
Hardcoded MUI Avatar. Zero reference to `item.imageUrl` or any image field.

**Frontend — `HomePage.jsx` mini-cart (lines 580–586)**
```jsx
<span aria-hidden="true" className="text-xl" style={{ color: C.textDim }}>&#128230;</span>
```
Hardcoded emoji in the HomePage mini-cart sidebar. Same bug, second location.

**Backend — `CartItemDTO.java` (full file)**
```java
public class CartItemDTO {
    private Long productId;
    private String productName;
    private int quantity;
    private double price;
    // No imageUrl field
}
```

**Backend — `CartServiceImpl.mapToDTO()` (lines 47–54)**
```java
CartItemDTO itemDTO = new CartItemDTO();
itemDTO.setProductId(item.getProduct().getProductId());
itemDTO.setProductName(item.getProduct().getProductName());
itemDTO.setQuantity(item.getQuantity());
itemDTO.setPrice(item.getProduct().getPrice());
// item.getProduct().getImageUrl() is never mapped
```

**The data DOES exist.** `Product.java` has `imageUrl` on line 26 with getter on line 118. The Cloudinary URL is in the database — it is simply never mapped through the DTO chain to the frontend.

### Root Cause Chain

```
Product.imageUrl  ──exists──►  CartItem.product.imageUrl  ──NOT MAPPED──►  CartItemDTO  (missing field)
                                                                                │
                               CartServiceImpl.mapToDTO() skips imageUrl ────►◄┘
                                                                                │
CartPage.jsx never reads item.imageUrl ─────────────────────────────────────►◄┘
HomePage.jsx mini-cart never reads item.imageUrl ───────────────────────────►◄┘
```

### Missing Components

**Backend:**
- `CartItemDTO` — needs `imageUrl` field + getter/setter
- `CartServiceImpl.mapToDTO()` — needs `itemDTO.setImageUrl(item.getProduct().getImageUrl())`

**Frontend:**
- `CartPage.jsx` — replace MUI Avatar+Icon block with `<img src={item.imageUrl} />` (with fallback)
- `HomePage.jsx` mini-cart — replace emoji span with `<img src={item.imageUrl} />` (with fallback)

---

## Task 3 — Fetch real user count in admin dashboard

**Status: NOT STARTED (frontend only)**

### Evidence

**Frontend — `AdminDashboardPage.jsx` initial `useEffect` (lines 203–211)**
```js
useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchOrders();
    // fetchUsers() is never called
}, []);
```

No `users` state exists. No `fetchUsers()` function exists. Nowhere in the 850+ line file is `/admin/users` called.

**Users stat card (line 776):**
```jsx
<h2 className="text-2xl md:text-4xl font-bold mt-2 md:mt-3">0</h2>
```
Raw integer literal `0`. Not a state variable.

**Backend — `UserController.java` (lines 31–45)**
The endpoint already exists and returns a real list:
```java
@GetMapping("/users")
public ResponseEntity<List<UserDTO>> getAllUsers() {
    List<UserDTO> users = userRepository.findAll()...
    return ResponseEntity.ok(users);
}
```

### Root Cause

Frontend oversight — no one ever wired the fetch. The backend is complete and functional. This is a pure frontend-only fix.

### Missing Components

**Frontend only:**
- New `users` state: `const [users, setUsers] = useState([])`
- New `fetchUsers()` function calling `GET /api/admin/users`
- Add `fetchUsers()` call inside the initial `useEffect`
- Replace hardcoded `0` with `{users.length}` on line 776

**No backend changes needed.**

---

## Task 4 — Add shipping address form to checkout

**Status: NOT STARTED (both layers)**

### Evidence

**Frontend — `CheckoutPage.jsx`**

The entire `CheckoutForm` component (lines 38–140) contains only `<PaymentElement />` and a pay button. No address fields. No address state. No input for any shipping data.

The checkout `api.post` call (lines 86–90) sends an empty request body:
```js
await api.post(
    `/order/${userId}/checkout`,
    {},   // ← empty object, no shipping address
    { headers: { "X-XSRF-TOKEN": getXsrfToken() } }
);
```

**Backend — `OrderController.java` (lines 21–24)**
```java
@PostMapping("/{userId}/checkout")
public ResponseEntity<OrderDTO> checkout(@PathVariable Long userId) {
    return ResponseEntity.ok(orderService.checkout(userId));
}
```
Method accepts only `@PathVariable Long userId`. No `@RequestBody`. The frontend's empty body `{}` is intentionally ignored.

**Backend — `OrderServiceImpl.java` (line 48)**
```java
order.setShippingAddress("Address not provided");
```
Hardcoded string literal.

### Root Cause

End-to-end gap: no form, no request body, no controller parameter, hardcoded string in service. Every component of this feature is missing.

### Missing Components

**Backend:**
- New `CheckoutRequest.java` DTO in `payload/request/` — needs `shippingAddress` field (String)
- `OrderController.checkout()` — needs `@RequestBody CheckoutRequest request` parameter
- `OrderServiceImpl.checkout()` — needs `request.getShippingAddress()` replacing hardcoded string

**Frontend:**
- Shipping address form state (multiple fields: company, contact name, address, city, state, zip, country, phone)
- Form inputs UI in `CheckoutPage.jsx`
- Update `api.post` body to include `{ shippingAddress: formattedAddress }`

---

## Task 5 — Fix "Address not provided" in orders

**Status: NOT STARTED — INSEPARABLE FROM TASK 4**

### Evidence

`OrderServiceImpl.java:48`:
```java
order.setShippingAddress("Address not provided");
```

The `Order` entity has `shippingAddress` field (line 31) and setter (line 87). The DTO maps and returns it (line 147). The data path from service to API to frontend is complete — the only problem is the value is always this hardcoded string.

### Root Cause

Tasks 4 and 5 share the same root. Task 5 is the backend leg of Task 4. You cannot fix `"Address not provided"` until the controller accepts a real address from the request body. These must be implemented together.

### Missing Components

Same as Task 4 backend. Specifically: `CheckoutRequest.java` DTO, updated `OrderController` method signature, updated `OrderServiceImpl.checkout()` method to use the incoming address.

---

## Task 6 — Add `createdAt` field to Order DTO

**Status: NOT STARTED (both layers)**

### Evidence

**Backend — `Order.java` (full entity, lines 1–92)**

Entity fields: `orderId`, `totalAmount`, `user`, `status`, `customerName`, `customerEmail`, `shippingAddress`, `orderItems`.

**No timestamp field exists on the entity at all.** No `createdAt`, no `updatedAt`, no `@CreationTimestamp`.

**Backend — `OrderDTO.java` (full file)**

Fields: `orderId`, `totalAmount`, `items`, `status`, `userId`, `customerName`, `customerEmail`, `shippingAddress`.

**No `createdAt` in the DTO either.**

**Backend — `OrderServiceImpl.mapToDTO()` (lines 131–170)**

Maps all DTO fields — no date mapping because none exists on the entity.

### Root Cause

The timestamp was never added to the database schema or entity. It is not a mapping omission — the column does not exist in the `orders` table.

### Missing Components

**Backend:**
- `Order.java` — add `@CreationTimestamp private LocalDateTime createdAt` with getter (Hibernate auto-populates on insert; no setter needed)
- `OrderDTO.java` — add `private LocalDateTime createdAt` field with getter/setter
- `OrderServiceImpl.mapToDTO()` — add `dto.setCreatedAt(order.getCreatedAt())`
- **Database:** Hibernate `ddl-auto: update` may add the column automatically, but a proper migration script should be used if Flyway/Liquibase is in use

**Frontend:**
- `OrdersPage.jsx` — read and display `order.createdAt`

---

## CONSOLIDATED FINDINGS TABLE

| # | Task | Status | Backend Changes | Frontend Changes | Complexity |
|---|------|--------|----------------|-----------------|------------|
| P0.1 | Price range slider → API | Not Started | Controller param + Service query + Repository query | `fetchProducts()` + `useEffect` deps + URL builder | Medium — backend query is the hard part |
| P0.2 | Cart item images | Not Started | Add `imageUrl` to `CartItemDTO` + 1 line in `CartServiceImpl` | Fix 2 components: `CartPage.jsx` + `HomePage.jsx` mini-cart | Low — backend is 2 lines, frontend is replacing icons with `<img>` |
| P0.3 | Real user count in dashboard | Not Started | **None** | Add `fetchUsers()` + state + replace hardcoded `0` | Low — frontend only, ~10 lines |
| P0.4 + P0.5 | Shipping address form + fix "Address not provided" | Not Started | New `CheckoutRequest` DTO + update controller + update service | Full address form UI + updated API call | Medium — but business-critical |
| P0.6 | `createdAt` on Order | Not Started | Add `@CreationTimestamp` to entity + DTO + mapping | Display in `OrdersPage.jsx` | Low-Medium — schema change is the risk |

---

## RECOMMENDED IMPLEMENTATION ORDER

### 1st — P0.4 + P0.5 (Shipping address)
Every order currently records "Address not provided". Orders cannot be physically fulfilled. Highest business consequence.

### 2nd — P0.2 (Cart item images)
Backend is 2 lines. Frontend is replacing icons with `<img>` tags in 2 places. Highest ROI for effort. Immediate trust signal for B2B buyers who need to visually confirm the right part.

### 3rd — P0.3 (User count in admin)
~10 lines of frontend code, zero backend work. Quick win.

### 4th — P0.1 (Price slider)
Requires new backend query logic. More complex than it appears — needs backend work before frontend can be wired.

### 5th — P0.6 (createdAt)
Schema change carries migration risk. Implement last in Phase 1.
