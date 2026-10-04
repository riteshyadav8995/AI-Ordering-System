# AI-Powered Voice Ordering System

A full-stack, voice-first restaurant ordering platform that lets customers place and modify food orders using natural language while restaurant staff manage incoming orders through a real-time dashboard.

## Why This Project

Traditional ordering flows can be slow, error-prone, and heavily dependent on manual staff input. This project combines conversational AI, real-time updates, and a live operations dashboard to create a faster and more accessible ordering experience.

## Key Features

- Voice-based ordering using natural language
- AI intent parsing and structured cart updates
- Real-time cart synchronization with Socket.IO
- Live order tracking from Pending to Completed
- Admin dashboard for kitchen and restaurant staff
- Menu catalog CRUD management
- JWT-protected admin access
- Order history and preparation-time tracking
- MongoDB-backed menu and order data
- Fallback text input for accessibility and browser compatibility

## How It Works

1. A customer speaks an order in natural language.
2. The frontend captures the speech and sends the transcript to the backend.
3. Google Gemini interprets the request and maps it to menu items stored in the database.
4. The backend updates the cart and broadcasts changes through Socket.IO.
5. After checkout, the order appears instantly on the admin dashboard.
6. Staff update the order status, and the customer sees progress in real time.

## Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- Framer Motion
- Socket.IO Client

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- Socket.IO
- JWT Authentication

### AI
- Google Gemini API

## Core Modules

### Customer Ordering
Customers can speak or type requests, modify quantities and customizations, review the live cart, place an order, and track its status.

### AI Order Processing
The AI converts natural-language requests into structured order actions while being constrained to menu items available in the database.

### Real-Time Order Tracking
Socket.IO keeps the customer and restaurant dashboard synchronized without manual page refreshes.

### Admin Dashboard
Restaurant staff can manage menu items, monitor active orders, update preparation status, and review completed orders.

## Project Structure

```text
AI-Ordering-System/
├── frontend/              # Customer and admin interfaces
├── backend/               # API, AI orchestration, database and real-time events
├── AI_Voice_Ordering_BRD.md
└── README.md
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/riteshyadav8995/AI-Ordering-System.git
cd AI-Ordering-System
```

### 2. Install dependencies

Install dependencies separately inside the frontend and backend folders.

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 3. Configure environment variables

Create the required `.env` files for the backend and frontend. Depending on the current implementation, you may need values for:

```env
MONGODB_URI=
JWT_SECRET=
GEMINI_API_KEY=
```

Do not commit real API keys or secrets to GitHub.

### 4. Run the application

Start the backend and frontend development servers from their respective folders.

## Business Use Cases

- Quick-service restaurants
- Drive-thru ordering
- Self-service restaurant kiosks
- Cloud kitchens
- Voice-accessible ordering experiences
- Real-time kitchen order management

## Roadmap

- Real payment gateway integration
- AI-powered upselling and recommendations
- Customer profiles and repeat-order flows
- Inventory synchronization
- Kitchen Display System routing
- Advanced sales and AI-performance analytics

## Author

**Ritesh Kumar**  
Full-Stack Developer focused on scalable web applications, real-time systems, and AI-powered products.
