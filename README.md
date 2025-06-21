# FoodRescue 🍽️

A comprehensive web application that connects food donors with recipients within a 5km radius, promoting food rescue and reducing waste while building stronger communities.

## 🌟 Features

### Core Functionality
- **Location-Based Matching**: Interactive map showing food donations within 5km radius
- **Role-Based Access**: Three user types (Donors, Recipients, Admins) with distinct dashboards
- **Admin Verification**: All food donations verified for safety and quality
- **Real-Time Notifications**: Instant updates on donations and pickup confirmations
- **Smart Search & Filtering**: Find food by category, dietary requirements, and location

### User Roles

#### 🤝 Donors
- Post food donations with detailed information
- Upload photos and specify pickup instructions
- Track donation status and recipient feedback
- View donation history and impact metrics

#### 🙏 Recipients
- Browse available food donations on interactive map
- Reserve food items and coordinate pickup
- Rate and review donation experiences
- Access personalized recommendations

#### 👨‍💼 Admins
- Verify and approve food donations
- Manage user accounts and resolve disputes
- Access comprehensive analytics dashboard
- Monitor platform activity and safety

## 🚀 Tech Stack

- **Frontend**: Next.js 14 with TypeScript and App Router
- **Styling**: Tailwind CSS with custom design system
- **Database**: MySQL with Prisma ORM
- **Authentication**: JWT-based with role-based access control
- **Maps**: React Leaflet for interactive mapping
- **Notifications**: Real-time updates with React Toastify
- **Icons**: Lucide React for consistent iconography

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- MySQL 8.0+ (local or hosted)
- npm or yarn package manager

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd FoodRescue
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   DATABASE_URL="mysql://username:password@localhost:3306/foodrescue"

   # Authentication
   NEXTAUTH_SECRET=your-secret-key-here
   NEXTAUTH_URL=http://localhost:3000

   # Map API (optional - get your own API key)
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your-mapbox-token-here

   # Email (optional - for notifications)
   EMAIL_SERVER_USER=your-email@example.com
   EMAIL_SERVER_PASSWORD=your-email-password
   EMAIL_SERVER_HOST=smtp.gmail.com
   EMAIL_SERVER_PORT=587
   EMAIL_FROM=noreply@foodrescue.com
   ```

4. **Set up the database**
   Initialize Prisma and run migrations:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Schema

### User Model (Prisma)
```prisma
model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  password      String
  role          Role      @default(RECIPIENT)
  latitude      Float?
  longitude     Float?
  address       String?
  verified      Boolean   @default(false)
  profilePicture String?
  phone         String?
  organization  String?
  notifications Boolean   @default(true)
  radius        Int       @default(5)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  donations     FoodDonation[]
  reservations  Reservation[]
  reviews       Review[]
  
  @@map("users")
}

enum Role {
  DONOR
  RECIPIENT
  ADMIN
}
```

### Food Donation Model (Prisma)
```prisma
model FoodDonation {
  id                 String             @id @default(cuid())
  title              String
  description        String             @db.Text
  category           FoodCategory
  quantity           Int
  expiryDate         DateTime
  latitude           Float
  longitude          Float
  address            String
  status             DonationStatus     @default(AVAILABLE)
  verificationStatus VerificationStatus @default(PENDING)
  donorId            String
  images             String[]
  
  // Dietary information
  vegetarian         Boolean            @default(false)
  vegan              Boolean            @default(false)
  glutenFree         Boolean            @default(false)
  halal              Boolean            @default(false)
  kosher             Boolean            @default(false)
  
  createdAt          DateTime           @default(now())
  updatedAt          DateTime           @updatedAt
  
  donor              User               @relation(fields: [donorId], references: [id])
  reservations       Reservation[]
  reviews            Review[]
  
  @@map("food_donations")
}

enum FoodCategory {
  PREPARED
  PACKAGED
  FRESH
  BAKED
  FROZEN
}

enum DonationStatus {
  AVAILABLE
  RESERVED
  PICKED_UP
  CANCELLED
}

enum VerificationStatus {
  PENDING
  APPROVED
  REJECTED
}
```

## 🎯 Key Features Implementation

### Interactive Map
- Real-time display of available food donations
- 5km radius filtering based on user location
- Custom markers for different food categories
- Popup details with donation information

### Admin Verification System
- Queue-based review system for new donations
- Photo verification and quality checks
- Approval/rejection with admin notes
- Automated notifications to donors

### Real-Time Notifications
- Instant alerts for new donations in user's area
- Pickup confirmation notifications
- Status updates throughout the donation process
- Email notifications for important updates

## 🔐 Security Features

- **Input Validation**: Comprehensive validation on both client and server
- **Authentication**: Secure JWT-based authentication system
- **Role-Based Access**: Proper authorization for different user types
- **Data Sanitization**: Protection against XSS and injection attacks
- **Rate Limiting**: API protection against abuse
- **Secure File Uploads**: Safe image handling and storage

## 📱 Responsive Design

- Mobile-first approach with Tailwind CSS
- Optimized for all screen sizes
- Touch-friendly interface for mobile users
- Progressive Web App capabilities
- Offline functionality for map viewing

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run integration tests
npm run test:integration

# Run end-to-end tests
npm run test:e2e

# Check test coverage
npm run test:coverage
```

## 📊 Performance Optimization

- **Image Optimization**: Next.js Image component with automatic optimization
- **Code Splitting**: Automatic code splitting with Next.js App Router
- **Database Indexing**: Optimized MySQL queries with proper indexes
- **Caching**: Strategic caching for frequently accessed data
- **Lazy Loading**: Map components loaded on demand

## 🌍 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Setup
- Configure production MySQL URI
- Set up proper domain and SSL certificates
- Configure email service for notifications
- Set up map API keys and quotas

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests for new features
- Ensure responsive design compatibility
- Update documentation for API changes
- Follow the established code style and patterns

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the existing issues on GitHub
2. Create a new issue with detailed information
3. Contact support at support@foodrescue.com
4. Join our community Discord server

## 🏆 Impact

FoodRescue aims to:
- **Reduce Food Waste**: Connect surplus food with those who need it
- **Build Communities**: Foster local connections and mutual aid
- **Promote Sustainability**: Contribute to environmental conservation
- **Ensure Food Safety**: Maintain high standards through verification
- **Track Impact**: Provide transparent metrics on food rescue efforts

## 🔮 Future Enhancements

- **Mobile App**: Native iOS and Android applications
- **Blockchain Integration**: Transparent donation tracking
- **AI Recommendations**: Smart matching algorithms
- **Multi-language Support**: Internationalization
- **Advanced Analytics**: Detailed impact reporting
- **Corporate Partnerships**: Integration with restaurant chains
- **Volunteer Management**: Coordination of pickup volunteers

---

**Made with ❤️ for building stronger, more sustainable communities**
