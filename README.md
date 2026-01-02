# 📚 BookBarn - Complete Online Bookstore Ecosystem

A comprehensive, full-stack online bookstore platform featuring **multi-role authentication**, **real-time order tracking**, **vendor management**, **delivery logistics**, and **live location services**. Built with modern technologies to deliver a premium, mobile-responsive experience.

[![Live Demo](https://img.shields.io/badge/Live-Demo-success?style=for-the-badge)](https://bookbarnkhs.netlify.app)
[![Backend](https://img.shields.io/badge/Backend-Railway-blueviolet?style=for-the-badge)](https://bookapp-production-3e11.up.railway.app)

---

## ✨ Complete Feature Set

### 👤 **User Portal**
- 🔍 **Advanced Book Discovery**
  - Search by title, author, category
  - Filter by price range and availability
  - Category-based browsing (Fiction, Non-fiction, Business, Education, etc.)
  - Real-time stock indicators

- 🛒 **Shopping Experience**
  - Add to cart with quantity management
  - Buy Now for instant checkout
  - Persistent cart across sessions
  - Price breakdown (Subtotal, Shipping, Tax)

- 📍 **Live Location Services**
  - GPS-based address detection for checkout
  - Automatic address filling
  - IP-based fallback for desktop users
  - Google Maps integration

- 💳 **Secure Checkout**
  - Multiple payment methods (Card, COD)
  - Razorpay integration for payments
  - Order summary with detailed breakdown
  - Address validation

- 📦 **Order Management**
  - Real-time order tracking
  - Status updates (Pending → Confirmed → Shipped → Delivered)
  - Order history with detailed views
  - Delivery agent information
  - Timeline visualization

- 🔐 **Account Security**
  - OTP-based registration
  - Email verification
  - Secure password reset with OTP
  - Profile management
  - Password strength validation

### 🏪 **Vendor Portal**
- 📊 **Business Dashboard**
  - Real-time sales analytics
  - Revenue tracking
  - Inventory overview
  - Order statistics

- 📚 **Inventory Management**
  - Add books with image upload
  - Edit book details (title, author, price, stock, category)
  - Delete books
  - Stock level monitoring
  - Low stock alerts

- 📍 **Store Location**
  - GPS-based store address registration
  - Location visible to delivery agents
  - Google Maps integration for navigation

- 🔔 **Order Notifications**
  - Real-time order alerts
  - Auto-polling for new orders
  - Mark notifications as read
  - Order acceptance workflow

- 📦 **Order Processing**
  - View incoming orders
  - Accept and pack orders
  - Mark orders ready for delivery
  - Track order status
  - Customer contact information

- 👤 **Vendor Profile**
  - Business information management
  - Contact details
  - Password change
  - Account status tracking

### 🚚 **Delivery Agent Portal**
- 🗺️ **Smart Navigation**
  - Pickup address (Vendor store location)
  - Delivery address (Customer location)
  - One-click Google Maps navigation
  - Phone numbers for quick calling

- 📍 **Location Filtering**
  - Filter available orders by location
  - Area-based order search
  - Distance optimization

- 📦 **Delivery Management**
  - View available orders
  - Accept delivery assignments
  - Real-time status updates
  - Delivery history tracking

- 💰 **Earnings Tracking**
  - Payout calculation per delivery
  - Active tasks counter
  - Performance metrics

- 📱 **Mobile-Optimized**
  - Touch-friendly interface
  - GPS navigation
  - Instant status updates
  - Call integration

### 🛡️ **Admin Portal**
- 📊 **Analytics Dashboard**
  - Total users, vendors, delivery agents
  - Revenue tracking
  - Order statistics
  - Platform growth metrics
  - Visual charts and graphs

- 👥 **User Management**
  - View all users
  - User activity monitoring
  - Account status management

- 🏪 **Vendor Management**
  - Approve/reject vendor registrations
  - View all vendors
  - Vendor performance tracking
  - Status management (Pending, Approved, Rejected)

- 🚚 **Delivery Agent Management**
  - Agent registration approval
  - Performance monitoring
  - Area assignment

- 📚 **Inventory Oversight**
  - View all books (system + vendor books)
  - Global stock management
  - Price monitoring
  - Category management

- 📦 **Order Oversight**
  - View all platform orders
  - Order status management
  - Delivery agent assignment
  - Customer support

---

## 🛠️ Technology Stack

### **Backend**
| Technology | Version | Purpose |
|------------|---------|---------|
| Java | 17 | Core language |
| Spring Boot | 3.2.5 | Application framework |
| Spring Security | 6.x | Authentication & Authorization |
| Spring Data JPA | 3.x | Database ORM |
| Hibernate | 6.x | JPA implementation |
| MySQL | 8.0 | Primary database |
| JWT | - | Stateless authentication |
| BCrypt | - | Password hashing |
| Maven | 3.x | Build tool |
| Brevo API | - | Email service (OTP delivery) |

### **Frontend**
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI framework |
| Vite | 5.x | Build tool & dev server |
| Tailwind CSS | 3.x | Utility-first styling |
| Framer Motion | 11.x | Animations |
| Lucide React | - | Icon library |
| Axios | 1.x | HTTP client |
| React Router | 6.x | Client-side routing |

### **APIs & Services**
- **Brevo (Sendinblue)**: Email delivery for OTPs
- **OpenStreetMap Nominatim**: Reverse geocoding
- **ipapi.co**: IP-based geolocation
- **Google Maps**: Navigation integration
- **Razorpay**: Payment processing

### **Deployment & Infrastructure**
- **Frontend**: Netlify (Auto-deploy from GitHub)
- **Backend**: Railway (Managed hosting)
- **Database**: Railway MySQL (Managed instance)
- **Version Control**: GitHub
- **CI/CD**: Automated deployments

---

## 🎨 Design Features

### **Premium UI/UX**
- ✅ Glassmorphism effects
- ✅ Smooth animations with Framer Motion
- ✅ Dark mode support
- ✅ Gradient backgrounds
- ✅ Custom scrollbars
- ✅ Micro-interactions
- ✅ Loading states
- ✅ Toast notifications

### **Mobile Responsiveness**
- ✅ Touch-friendly (44px minimum touch targets)
- ✅ Responsive typography (auto-scaling)
- ✅ Single-column mobile layouts
- ✅ Safe area support (iPhone X+ notches)
- ✅ No zoom on input (16px base font)
- ✅ Smooth scrolling
- ✅ Optimized for all screen sizes
- ✅ Landscape mode support

### **Accessibility**
- ✅ Keyboard navigation
- ✅ Focus indicators
- ✅ ARIA labels
- ✅ Semantic HTML
- ✅ Color contrast compliance

---

## 📁 Project Structure

```
bookbarn/
├── bookapp/                          # Spring Boot Backend
│   ├── src/main/java/
│   │   └── com/example/book/
│   │       ├── config/               # Security, CORS
│   │       ├── controller/           # REST endpoints
│   │       ├── dto/                  # Data transfer objects
│   │       ├── model/                # JPA entities
│   │       ├── repository/           # Database access
│   │       ├── service/              # Business logic
│   │       └── BookApplication.java
│   ├── src/main/resources/
│   │   └── application.properties    # Configuration
│   └── pom.xml                       # Maven dependencies
│
├── frontend_bookapp/                 # React Frontend
│   ├── src/
│   │   ├── components/               # Reusable components
│   │   │   ├── BookCard.jsx
│   │   │   ├── Layout.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── ...
│   │   ├── pages/                    # Route pages
│   │   │   ├── Books.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── VendorDashboard.jsx
│   │   │   ├── DeliveryDashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── ...
│   │   ├── services/
│   │   │   └── api.js                # Axios configuration
│   │   ├── index.css                 # Global styles
│   │   └── main.jsx                  # Entry point
│   ├── package.json
│   └── vite.config.js
│
├── uploads/                          # Book cover images
├── README.md                         # This file
├── MOBILE_RESPONSIVE_GUIDE.md        # Mobile optimization guide
└── nixpacks.toml                     # Railway deployment config
```

---

## ⚡ Quick Start

### **Prerequisites**
- Java 17+
- Node.js 18+
- MySQL 8.0+
- Maven 3.x

### **1. Clone Repository**
```bash
git clone https://github.com/Hemanthsai8525/bookbarn.git
cd bookbarn
```

### **2. Backend Setup**

```bash
cd bookapp

# Configure database in src/main/resources/application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/bookstore
spring.datasource.username=root
spring.datasource.password=your_password

# Set environment variables
export BREVO_API_KEY=your_brevo_api_key
export BREVO_SENDER_EMAIL=your_verified_email@domain.com

# Run backend
mvn spring-boot:run
```

Backend runs at: `http://localhost:8080`

### **3. Frontend Setup**

```bash
cd frontend_bookapp

# Install dependencies
npm install

# Create .env file
echo "VITE_API_BASE=http://localhost:8080" > .env

# Run frontend
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 🚀 Deployment

### **Backend (Railway)**
1. Connect GitHub repository
2. Set root directory: `bookapp`
3. Add MySQL plugin
4. Set environment variables:
   ```
   BREVO_API_KEY=your_key
   BREVO_SENDER_EMAIL=your_email
   BREVO_SENDER_NAME=BookBarn
   ```
5. Deploy automatically

### **Frontend (Netlify)**
1. Connect GitHub repository
2. Build settings:
   - Base directory: `frontend_bookapp`
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Environment variables:
   ```
   VITE_API_BASE=https://your-backend.railway.app
   ```
4. Deploy automatically

---

## 🔐 Security Features

- **JWT Authentication**: Stateless, scalable authentication
- **Role-Based Access Control (RBAC)**: 4 distinct roles (User, Vendor, Delivery Agent, Admin)
- **BCrypt Password Hashing**: Industry-standard encryption
- **OTP Verification**: Email-based verification for registration and password reset
- **CORS Protection**: Configured for trusted domains only
- **SQL Injection Prevention**: JPA/Hibernate parameterized queries
- **XSS Protection**: React's built-in escaping
- **HTTPS**: Enforced in production
- **Environment Variables**: Sensitive data externalized

---

## 📱 Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 90+ | ✅ Fully Supported |
| Firefox | 88+ | ✅ Fully Supported |
| Safari | 14+ | ✅ Fully Supported |
| Edge | 90+ | ✅ Fully Supported |
| Mobile Safari (iOS) | 12+ | ✅ Fully Supported |
| Chrome Mobile (Android) | 90+ | ✅ Fully Supported |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Hemanth Sai**
- GitHub: [@Hemanthsai8525](https://github.com/Hemanthsai8525)

---

## 🙏 Acknowledgments

- Spring Boot team for the excellent framework
- React team for the powerful UI library
- Tailwind CSS for utility-first styling
- Brevo for reliable email delivery
- Railway & Netlify for seamless deployment

---

**Made with ❤️ for BookBarn**
