# Oshudh : Multi-Vendor Medicine E-commerce Platform 💊

**Your Trusted Healthcare Marketplace**

## 🌐 Live Demo
- **Client:** https://oshudh-a12.web.app/
- **Server:** https://oshudh-a12.vercel.app/

## 👨‍💻 Admin Credentials
-contact me for admin credentials

## 💼 Seller Credentials  
-contact me for seller credentials

## 📋 Project Overview

Oshudh is a comprehensive multi-vendor e-commerce platform specializing in medicine and healthcare products. Built with the MERN stack, it provides a seamless experience for customers to purchase medications, sellers to manage their inventory, and administrators to oversee the entire platform operations.

## 🎯 Purpose

This platform serves as a complete solution for online medicine sales, allowing stakeholders to:
- **Browse & Purchase** - Explore medicines with advanced filtering and secure checkout
- **Vendor Management** - Multi-seller platform with role-based access control
- **Admin Oversight** - Comprehensive dashboard for platform management
- **Healthcare Focus** - Specialized features for pharmaceutical e-commerce

---

## ✨ Key Features

### 🔐 **Authentication & Security**
- **Firebase Authentication** - Email/Password & Google Sign-In
- **JWT Token Management** - Secure HTTP-only cookie implementation
- **Role-Based Access Control** - Admin, Seller, and User roles
- **Private Route Protection** - Secure access to sensitive areas
- **Session Persistence** - Maintain login state across sessions

### 💊 **Medicine Management**
- **Multi-Vendor Support** - Multiple sellers can list medicines
- **Category Organization** - Organized by medicine types (Tablet, Syrup, Capsule, etc.)
- **Advanced Search & Filtering** - By name, category, company, price range
- **Inventory Management** - Real-time stock tracking and updates
- **Discount System** - Promotional pricing with percentage discounts

### 🛒 **E-commerce Features**
- **Shopping Cart** - Add, remove, update quantities
- **Secure Checkout** - Stripe payment integration
- **Invoice Generation** - PDF invoice download after purchase
- **Order Tracking** - Real-time order status updates
- **Payment Management** - Admin approval system for transactions

### 📊 **Dashboard Systems**
- **Admin Dashboard** - User management, category control, sales reporting
- **Seller Dashboard** - Medicine inventory, sales analytics, advertisement requests
- **User Dashboard** - Purchase history and profile management
- **Advertisement System** - Seller-requested homepage banner advertisements

### 🎨 **User Experience**
- **Fully Responsive Design** - Mobile, tablet, desktop optimized
- **Dynamic Content** - Real-time updates with TanStack Query
- **Toast Notifications** - SweetAlert2 for user feedback
- **Loading States** - Enhanced UX during operations
- **Pagination & Sorting** - Efficient data browsing

### 🔧 **Technical Features**
- **Environment Security** - Protected Firebase & MongoDB credentials
- **Data Export** - PDF, Excel, CSV format support for reports
- **Date Range Filtering** - Advanced filtering for sales reports
- **Form Validation** - React Hook Form implementation
- **Dynamic Titles** - SEO-optimized page titles

---

## 🛠️ Technology Stack

### **Frontend**
```json
{
  "core": ["React 18", "React Router 6", "JavaScript ES6+"],
  "styling": ["Tailwind CSS", "DaisyUI", "CSS3"],
  "state": ["TanStack Query", "Context API", "React Hook Form"],
  "authentication": ["Firebase 10", "JWT"],
  "animations": ["Lottie React", "Swiper"],
  "notifications": ["SweetAlert2", "React Toastify"],
  "exports": ["jsPDF", "xlsx", "react-csv"],
  "icons": ["React Icons"],
  "build": ["Vite", "ESLint"]
}
```

### **Backend**
```json
{
  "runtime": ["Node.js", "Express.js"],
  "database": ["MongoDB Atlas", "Native MongoDB Driver"],
  "authentication": ["Firebase Admin SDK"],
  "payments": ["Stripe API"],
  "security": ["CORS", "Cookie Parser"],
  "environment": ["dotenv"]
}
```

---

## 📦 Package Dependencies

### **Client-side Dependencies**
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.28.0",
  "firebase": "^10.8.0",
  "@tanstack/react-query": "^5.0.0",
  "axios": "^1.6.0",
  "react-hook-form": "^7.48.0",
  "tailwindcss": "^3.4.0",
  "daisyui": "^4.4.0",
  "sweetalert2": "^11.0.0",
  "react-icons": "^4.12.0",
  "lottie-react": "^2.4.0",
  "swiper": "^11.0.0",
  "jspdf": "^2.5.0",
  "xlsx": "^0.18.0",
  "react-csv": "^2.2.0",
  "re-title": "^2.2.0"
}
```

### **Server-side Dependencies**
```json
{
  "express": "^4.18.0",
  "mongodb": "^6.3.0",
  "firebase-admin": "^12.0.0",
  "stripe": "^14.0.0",
  "cors": "^2.8.5",
  "cookie-parser": "^1.4.6",
  "dotenv": "^16.3.0"
}
```

---

## 🚀 Installation & Setup

### **Prerequisites**
- Node.js (v18 or higher)
- npm
- MongoDB Atlas account
- Firebase project
- Stripe account

### **1. Clone Repository**
```bash
# Frontend
git clone https://github.com/Programming-Hero-Web-Course4/b11a12-client-side-osmanfaruque
cd client-a12
npm install

# Backend  
git clone https://github.com/Programming-Hero-Web-Course4/b11a12-server-side-osmanfaruque
cd server-a12
npm install
```

### **2. Environment Variables**

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

**Backend (.env)**
```env
MONGO_URI=your_mongodb_connection_string
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
STRIPE_SECRET_KEY=your_stripe_secret_key
PORT=5000
```

### **3. Run Development Servers**
```bash
# Frontend (localhost:5173)
npm start

# Backend (localhost:5000)
npm start
```

---

## 📱 Pages & Routes

### **Public Routes**
| Route | Description |
|-------|-------------|
| `/` | Homepage with slider, categories, discounts |
| `/shop` | All medicines with search & filtering |
| `/category/:categoryName` | Category-specific medicines |
| `/cart` | Shopping cart management |
| `/login` | User authentication |
| `/register` | User registration |

### **Private Routes**
| Route | Access Level | Description |
|-------|--------------|-------------|
| `/checkout` | User | Stripe payment process |
| `/invoice` | User | PDF invoice download |
| `/dashboard/user` | User | Payment history |
| `/dashboard/seller/*` | Seller | Medicine & sales management |
| `/dashboard/admin/*` | Admin | Platform administration |

---

## 🎨 Platform Features

### **Homepage Sections**
- **🎬 Advertisement Slider** - Admin-managed product banners
- **📋 Category Cards** - 6+ medicine categories with counts
- **💰 Discount Products** - Draggable slider of discounted items
- **ℹ️ About Section** - Platform information
- **💬 Testimonials** - Customer reviews

### **Dashboard Features**

#### **👑 Admin Dashboard**
- **📊 Revenue Analytics** - Total sales, paid/pending amounts
- **👥 User Management** - Role assignments (User ↔ Seller ↔ Admin)
- **📂 Category Management** - CRUD operations for medicine categories
- **💳 Payment Management** - Approve/reject payment transactions
- **📈 Sales Reports** - Exportable reports with date filtering
- **📺 Banner Management** - Control homepage advertisement slider

#### **🏪 Seller Dashboard**
- **💰 Sales Revenue** - Personal earnings dashboard
- **💊 Medicine Management** - Add, edit, delete medicine inventory
- **📋 Payment History** - Track sales and payment status
- **📢 Advertisement Requests** - Request homepage banner placement

#### **👤 User Dashboard**
- **🧾 Payment History** - Complete purchase history with transaction IDs

---

## 🔒 Security Implementation

### **Authentication Flow**
1. **Firebase Authentication** - Secure user registration/login
2. **JWT Tokens** - Server-side token verification
3. **Role-Based Access** - Admin, Seller, User permission levels
4. **Protected Routes** - Frontend and backend route protection
5. **Session Management** - Persistent login across page reloads

### **Data Security**
- **Input Validation** - Comprehensive form validation
- **CORS Configuration** - Restricted origin access
- **Environment Variables** - Secure credential storage
- **Payment Security** - Stripe PCI compliance
- **MongoDB Security** - Indexed queries and data validation

---

## 📊 Database Schema

### **Users Collection**
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  photoURL: String,
  role: String, // 'user', 'seller', 'admin'
  createdAt: Date,
  updatedAt: Date
}
```

### **Medicines Collection**
```javascript
{
  _id: ObjectId,
  itemName: String,
  genericName: String,
  shortDescription: String,
  imageUrl: String,
  category: String,
  company: String,
  massUnit: String,
  perUnitPrice: Number,
  discountPercentage: Number,
  sellerEmail: String,
  sellerName: String,
  stock: Number,
  sales: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### **Orders Collection**
```javascript
{
  _id: ObjectId,
  orderId: String,
  transactionId: String,
  buyerEmail: String,
  buyerName: String,
  sellerEmail: String,
  sellerName: String,
  medicines: Array,
  totalAmount: Number,
  status: String, // 'pending', 'paid'
  paymentMethod: String,
  createdAt: Date,
  paidAt: Date
}
```

### **Categories Collection**
```javascript
{
  _id: ObjectId,
  categoryName: String (unique),
  categoryImage: String,
  description: String,
  createdAt: Date
}
```

---

## 🚀 Deployment

### **Frontend Deployment (Firebase Hosting)**
```bash
npm run build
firebase deploy
```

### **Backend Deployment (Vercel)**
```bash
# Configure vercel.json for Express.js
# Set environment variables in Vercel dashboard
```

### **Database Setup**
- **MongoDB Atlas** - Cloud database with proper indexing
- **Connection Security** - IP whitelisting and authentication

---

## 📈 Business Logic

### **E-commerce Workflow**
1. **Product Discovery** - Browse/search medicines
2. **Cart Management** - Add items with quantity control
3. **Secure Checkout** - Stripe payment processing
4. **Order Fulfillment** - Admin payment approval
5. **Invoice Generation** - PDF receipt download

### **Multi-Vendor System**
- **Seller Onboarding** - Registration with seller role
- **Inventory Management** - Independent medicine listings
- **Revenue Tracking** - Individual seller analytics
- **Advertisement Platform** - Promotional opportunity system

---

## 🎯 Key Challenges Implemented

### **✅ Completed Challenges**
- [x] **Pagination & Sorting** - All data tables with search functionality
- [x] **JWT Authentication** - Secure API access with token verification
- [x] **Export Functionality** - PDF, Excel, CSV downloads for reports
- [x] **Date Range Filtering** - Advanced filtering for sales analytics
- [x] **React Hook Form** - Comprehensive form validation
- [x] **Dynamic Titles** - SEO-optimized page titles with re-title


---

## 👨‍💻 Developer Information

**Developer:** Osman Faruque  
**Contact:** [osmanfaruque](#)  
**Project Type:** Full-Stack Multi-Vendor E-commerce Platform  
**Development Period:** 2025  

---

## 📈 Future Enhancements

- [ ] **Mobile Application** - React Native implementation
- [ ] **Real-time Notifications** - Socket.io integration
- [ ] **Advanced Analytics** - Detailed business intelligence
- [ ] **Prescription Upload** - Medical prescription verification
- [ ] **Delivery Tracking** - Real-time order tracking
- [ ] **AI Recommendations** - Smart medicine suggestions

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

---

## 🙏 Acknowledgments

- **Firebase** - Authentication and hosting services
- **MongoDB Atlas** - Database hosting platform
- **Stripe** - Secure payment processing
- **TanStack Query** - Powerful data fetching library
- **Tailwind CSS** - Utility-first CSS framework
- **Programming Hero** - Course guidance and support

---

<div align="center">

**⭐ Star this repository if you found it helpful!**

**Made with ❤️ by [Osman Faruque](https://github.com/osmanfaruque)**

**🏥 Revolutionizing Healthcare E-commerce**

</div>
