# Mahbub Alam Portfolio - Next.js + MongoDB

A modern, SEO-optimized portfolio website built with Next.js 14, MongoDB, and Server-Side Rendering (SSR).

## 🚀 Features

- **Server-Side Rendering (SSR)** - Better SEO and performance
- **MongoDB Integration** - Scalable database solution
- **SEO Optimized** - Meta tags, structured data, sitemap
- **Responsive Design** - Mobile-first approach
- **Performance Optimized** - Dynamic imports, image optimization
- **Visitor Analytics** - Track page visits and user behavior
- **Admin Panel** - Manage portfolio data (mahbub.dev domain only)

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, Bootstrap 5
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Styling**: CSS Modules, Bootstrap
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

- Node.js 18+
- MongoDB (local or cloud)
- npm or yarn

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd react_portfolio
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```bash
cp env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/portfolio

# Next.js Configuration
NEXT_PUBLIC_BASE_URL=https://mahbub.dev

# Google Analytics (optional)
NEXT_PUBLIC_GA_ID=your-google-analytics-id

# Google Search Console (optional)
NEXT_PUBLIC_GOOGLE_VERIFICATION=your-google-verification-code

# Admin Domain (for data management)
NEXT_PUBLIC_ADMIN_DOMAIN=mahbub.dev
```

### 3. Data Migration (Optional)

If you have existing Firebase data, migrate it to MongoDB:

```bash
# Install Firebase dependencies for migration
npm install firebase

# Run migration script
node scripts/migrateToMongoDB.js
```

### 4. Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
src/
├── app/                    # Next.js 13+ App Router
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.js          # Root layout
│   └── page.js            # Home page
├── components/            # React components
├── hooks/                 # Custom hooks
├── lib/                   # Utilities (MongoDB connection)
├── models/                # MongoDB schemas
└── types/                 # TypeScript types
```

## 🔧 Configuration

### MongoDB Setup

1. **Local MongoDB**:

   ```bash
   # Install MongoDB locally
   brew install mongodb-community  # macOS
   sudo systemctl start mongod     # Linux
   ```

2. **MongoDB Atlas** (Cloud):
   - Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a cluster
   - Get connection string
   - Update `MONGODB_URI` in `.env.local`

### SEO Configuration

Update metadata in `src/app/layout.js`:

```javascript
export const metadata = {
  title: "Your Name | Your Title",
  description: "Your description",
  // ... other metadata
};
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/portfolio
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

## 📊 API Endpoints

- `GET /api/portfolio` - Fetch all portfolio data
- `POST /api/portfolio` - Add new item (admin only)
- `PUT /api/portfolio/[collection]/[id]` - Update item (admin only)
- `DELETE /api/portfolio/[collection]/[id]` - Delete item (admin only)
- `GET /api/visitors` - Get visitor statistics
- `POST /api/visitors` - Track visitor
- `GET /api/sitemap` - Generate sitemap

## 🔒 Security

- Admin operations restricted to `mahbub.dev` domain
- Input validation and sanitization
- CORS protection
- Rate limiting (recommended for production)

## 📈 Performance

- Server-Side Rendering for better SEO
- Dynamic imports for code splitting
- Image optimization with Next.js
- MongoDB indexing for faster queries
- Caching strategies

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**:

   - Check `MONGODB_URI` in `.env.local`
   - Ensure MongoDB is running
   - Verify network connectivity

2. **Build Errors**:

   ```bash
   npm run build
   # Check for TypeScript errors
   ```

3. **API Route Issues**:
   - Check API route files in `src/app/api/`
   - Verify MongoDB connection in API routes

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- MongoDB for the database solution
- Bootstrap for the UI components
- Original Firebase implementation

---

**Note**: This is a conversion from a React + Firebase project to Next.js + MongoDB. The original Firebase configuration and data structure have been preserved for compatibility.
