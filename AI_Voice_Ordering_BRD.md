# Business Requirements Document (BRD)

## Project Title
**AI-Powered Voice Ordering System & Real-Time Restaurant Dashboard**

---

## 1. Business Objective
The goal of this project is to build an intelligent, voice-first ordering application that allows customers to interact with an AI-Voice-Assistant to browse menus, customize items, and place food orders using natural language. Additionally, it provides restaurant staff with a real-time, glassmorphic admin dashboard to manage catalog items and track live orders efficiently. 

This solution will revolutionize the drive-thru, dine-in, and remote ordering experience by reducing manual order-taking, minimizing human error, and streamlining kitchen operations through real-time Socket.io integrations.

## 2. Problem Statement
Traditional food ordering systems rely heavily on manual data entry by cashiers or complex, click-heavy mobile applications that frustrate users. 
Common problems include:
*   **High Wait Times:** Customers spend too much time navigating nested menus on screens or waiting for a human cashier.
*   **Order Inaccuracy:** Miscommunication between cashiers and customers leads to incorrect orders, especially with complex customizations.
*   **Staff Overhead:** Restaurants spend significant resources staffing order-taking roles instead of focusing on food preparation and quality.
*   **Lack of Real-Time Sync:** Kitchen staff often rely on printed tickets or delayed POS updates, leading to bottlenecks.
*   **Accessibility Issues:** Traditional UI-based apps exclude visually impaired users or those who prefer hands-free interactions (e.g., while driving).

## 3. Proposed Solution
Build a full-stack, voice-enabled web application that acts as an autonomous virtual cashier. 
*   **Frontend (Customer):** A voice-activated interface where users speak naturally to an AI. The AI processes the intent, updates a live cart, and allows seamless checkout. 
*   **Frontend (Admin):** A sleek, dark-themed, real-time dashboard for staff to manage menu items, monitor incoming orders instantly, and update order statuses.
*   **Backend:** Node.js/Express server handling AI orchestration, MongoDB database operations, and Socket.io for instantaneous bidirectional communication between the customer and the kitchen.

## 4. Target Users
*   **Quick Service Restaurants (QSRs):** Looking to automate drive-thrus or in-store kiosks.
*   **Ghost Kitchens & Cloud Kitchens:** Needing efficient, staff-free order ingestion.
*   **Everyday Consumers:** Customers who want a fast, hands-free ordering experience.
*   **Visually Impaired Users:** Individuals who require voice-first accessibility to order food independently.
*   **Restaurant Managers & Chefs:** Staff who need a clear, organized, real-time view of what needs to be cooked and when.

---

## 5. System Modules List

### 5.1 Voice Interaction & AI Processing
**Purpose:** Handle natural language input from the user and convert it into structured order data.
**Workflow:**
1. User activates the microphone and speaks their order (e.g., "I want two classic burgers with extra cheese and a large coke").
2. The browser captures the audio stream and converts it to text (or streams directly).
3. The frontend sends the transcript to the Backend AI Service (Google Gemini).
4. The AI parses the intent, identifies menu items, matches them against the database catalog, and extracts customizations/quantities.
5. The AI triggers a function call `update_cart` with structured JSON.
6. The Backend processes the function call and broadcasts the updated cart via Socket.io back to the customer's screen.
**Business Benefit:** Provides a frictionless, human-like ordering experience without the staffing cost.

### 5.2 Live Cart Management
**Purpose:** Display the AI's understanding of the order in real-time so the user can verify it.
**Workflow:**
1. The frontend receives Socket.io events containing the current cart state.
2. The UI renders a glowing, glassmorphic cart panel showing items, quantities, customizations, and live total price.
3. The user can verbally modify the cart ("Actually, make that three burgers") or use UI buttons to finalize the payment.
**Business Benefit:** Builds trust by showing the user exactly what the AI heard, preventing order mistakes before payment.

### 5.3 Order Placement & Real-Time Tracking
**Purpose:** Process the final checkout and provide transparency to the customer on kitchen progress.
**Workflow:**
1. Customer clicks "Make Payment" (simulating a UPI/Card transaction).
2. The frontend sends a `POST /api/orders` request with the cart data and payment method.
3. The Backend creates an Order document in MongoDB with a `Pending` status and records the exact timestamp.
4. The Backend emits a `newOrder` Socket.io event to the Admin Dashboard.
5. The Customer is redirected to the "My Orders" tab.
6. As the Admin updates the status (Preparing -> Ready -> Completed), the Customer's UI updates a progress bar in real-time.
**Business Benefit:** Enhances customer satisfaction by eliminating the "black box" of waiting for food.

### 5.4 Kitchen Order Management (Admin)
**Purpose:** Allow kitchen staff to view and manage live incoming orders.
**Workflow:**
1. Admin logs into the secure dashboard.
2. The "Live Orders" tab displays grid cards of all active orders.
3. New orders appear instantly with a glowing border and timestamp.
4. Staff click "Start Preparing", changing the status and notifying the customer instantly.
5. Staff click "Mark Ready" and eventually "Complete Order".
6. Completed orders are moved to the "Order History" tab.
**Business Benefit:** Streamlines kitchen operations, reduces ticket loss, and measures preparation times.

### 5.5 Menu Catalog Manager (Admin)
**Purpose:** Allow restaurant managers to dynamically update what the AI can sell.
**Workflow:**
1. Admin switches to the "Menu Manager" tab.
2. Views a data table of all products (Name, Description, Category, Price).
3. Admin clicks "Add Product" to open a modal form.
4. Upon saving, the item is instantly stored in MongoDB.
5. The AI is dynamically fed this updated catalog in its system prompt, meaning it can immediately start selling the new item.
**Business Benefit:** Zero-downtime menu updates. No need to retrain the AI; it instantly adapts to stock and menu changes.

---

## 6. Functional Requirements

### 6.1 Customer Requirements
*   Customer must be able to start and stop voice recording with a single tap.
*   Customer must see a real-time transcript of what they are saying.
*   Customer must see AI voice responses in text format.
*   Customer must see their cart update instantly when the AI processes a change.
*   Customer must be able to finalize the order using a "Make Payment" button.
*   Customer must be able to view past orders in a "My Orders" history tab.
*   Customer must see a live progress bar tracking their active order status.
*   Customer must see the exact time and duration for each preparation step.

### 6.2 Admin Requirements
*   Admin must be authenticated to access the dashboard.
*   Admin must see a live grid of incoming orders without refreshing the page.
*   Admin must be able to change order status (Pending -> Preparing -> Ready -> Completed).
*   Admin must be able to view a historical log of all completed orders.
*   Admin must be able to Create, Read, Update, and Delete (CRUD) menu items.
*   Admin must see analytics/timestamps showing how long an order took at each step.

### 6.3 System & AI Requirements
*   The AI must strictly only sell items that exist in the database menu.
*   The AI must handle fuzzy matching (e.g., if a user says "Coke", it should map to "Coca-Cola").
*   The AI must politely decline requests for non-menu items.
*   The system must use WebSockets (Socket.io) for sub-second bidirectional updates.

---

## 7. Non-functional Requirements
*   **Performance:** AI response time must be under 3 seconds. Socket events must broadcast in under 100ms.
*   **Availability:** The backend must handle reconnects gracefully if the WebSocket drops.
*   **Security:** Admin routes must be protected with JWT authentication. Payment simulation must validate enums on the backend.
*   **UI/UX:** The interface must use modern glassmorphism, dark mode aesthetics, and micro-animations (Framer Motion) for a premium feel.
*   **Scalability:** The MongoDB schema must be structured to handle thousands of concurrent orders.

---

## 8. Data Requirements

### 8.1 Order Data Schema
*   `_id`: Object ID
*   `user`: User ID (Reference)
*   `customerName`: String
*   `items`: Array of Objects
    *   `menuItem`: Menu ID
    *   `name`: String
    *   `quantity`: Number
    *   `price`: Number
    *   `customizations`: Array of Strings
    *   `notes`: String
*   `totalAmount`: Number
*   `status`: Enum (`Pending`, `Preparing`, `Ready`, `Completed`, `Cancelled`)
*   `paymentMethod`: Enum (`cash`, `upi`, `credit_card`, `debit_card`)
*   `paymentStatus`: Enum (`Pending`, `Paid`)
*   `statusTimestamps`: Object
    *   `pending`: Date
    *   `preparing`: Date
    *   `ready`: Date
    *   `completed`: Date
*   `createdAt`: Date

### 8.2 Menu Data Schema
*   `_id`: Object ID
*   `name`: String (Unique)
*   `description`: String
*   `price`: Number
*   `category`: Enum (`Starters`, `Mains`, `Sides`, `Beverages`, `Desserts`)
*   `isAvailable`: Boolean
*   `image`: String (URL)

---

## 9. Integrations Required
*   **Google Gemini API:** Core NLP engine for conversational AI and function calling.
*   **Socket.io:** Real-time event broadcasting between server, admin, and customer.
*   **MongoDB / Mongoose:** NoSQL database for flexible document storage.
*   **Vite & React:** Frontend SPA framework.
*   **TailwindCSS & Framer Motion:** For advanced UI styling and animations.

---

## 10. Business Rules
*   An order cannot be placed if the cart is empty.
*   The AI cannot apply discounts unless explicitly programmed in a promotional module.
*   Payment methods must be strictly validated against allowed enums to prevent database corruption.
*   Completed orders must be moved out of the active "Live Orders" view to prevent clutter.
*   The progress bar width must accurately reflect the status enum mathematically (0%, 33%, 66%, 100%).

---

## 11. Success Metrics
*   **Time-to-Order:** Average time from interaction start to payment complete should be < 60 seconds.
*   **Order Accuracy:** AI intent parsing should correctly map items 95%+ of the time.
*   **Kitchen Efficiency:** Admin dashboard usage should reduce average order fulfillment time by 20%.
*   **System Reliability:** Zero dropped Socket connections during standard operation.

---

## 12. Priority Roadmap

### Phase 1: MVP (Minimum Viable Product) - *Completed*
*   Voice-to-text integration with Gemini.
*   Function calling for live cart updates.
*   Basic Admin Dashboard for menu management.
*   Order placement and real-time status tracking.
*   Order history and timestamp analytics.

### Phase 2: Revenue & Retention Automation - *Next Steps*
*   **Upsell AI:** Train the AI to recommend sides/drinks based on current cart contents.
*   **User Profiles & Favorites:** Allow logged-in users to say "Reorder my usual".
*   **Payment Gateway Integration:** Connect Stripe or Razorpay for real transactions.

### Phase 3: Advanced Operations
*   **Inventory Sync:** Automatically mark items "Out of Stock" and inform the AI.
*   **Kitchen Display System (KDS) Routing:** Route drinks to the bar station and food to the grill station automatically.
*   **Analytics Dashboard:** Generate daily sales reports, AI success rates, and peak hour metrics.

---

## 13. Risks & Mitigation
| Risk | Impact | Mitigation |
| :--- | :--- | :--- |
| **AI Hallucinations** | AI sells items not on the menu. | Pass the exact database menu string into the system prompt and enforce strict backend validation on `createOrder`. |
| **WebRTC/Mic Issues** | Voice ordering fails on unsupported browsers. | Provide a fallback text-input box for traditional typing. |
| **WebSocket Disconnects** | Kitchen doesn't see new orders. | Implement Socket.io auto-reconnect logic and a polling fallback if WS fails. |

---

## 14. Execution Plan (Rollout)
1.  **Staging Deployment:** Deploy Backend to Render and Frontend to Vercel/Netlify.
2.  **QA Testing:** Run mock orders using various accents and complex requests (e.g., changing minds mid-sentence).
3.  **Staff Training:** Provide the kitchen staff a 15-minute walkthrough of the Admin Dashboard.
4.  **Soft Launch:** Enable voice ordering for a single kiosk or subset of users.
5.  **Monitoring:** Monitor MongoDB logs and Gemini API latency. Iterate on the AI System Prompt based on real transcript data.

---
*Document automatically generated for the AI Voice Ordering System Project.*
