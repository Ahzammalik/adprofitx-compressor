# AdProfitX Compressor

A professional image and PDF compression website built with HTML, CSS, and JavaScript. Features advanced compression options, real-time analytics, SEO optimization, and AdSense integration.

## 🚀 Features

- **Image Compression**: Support for JPEG, PNG, and WebP formats
- **PDF Compression**: Advanced PDF optimization using PDF-lib
- **Drag & Drop Interface**: Intuitive file upload experience
- **Advanced Options**: Quality control, format conversion, and resize capabilities
- **Real-time Analytics**: PostgreSQL database tracking compression statistics
- **SEO Optimized**: Comprehensive meta tags and structured data
- **AdSense Ready**: Pre-configured ad placements and ads.txt
- **Responsive Design**: Mobile-first approach with modern UI
- **Batch Processing**: Handle multiple files simultaneously

## 🛠️ Technology Stack

- **Frontend**: Vanilla HTML5, CSS3, ES6+ JavaScript
- **Backend**: Node.js with custom API endpoints
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Custom CSS with Flexbox/Grid layouts
- **Icons**: Font Awesome 6.4.0
- **Typography**: Google Fonts (Inter)
- **PDF Processing**: PDF-lib library (v1.17.1)
- **Image Processing**: HTML5 Canvas API

## 📁 Project Structure

```
├── index.html              # Main HTML file
├── styles.css              # Main stylesheet
├── script.js               # Frontend JavaScript
├── ads.txt                 # Google AdSense configuration
├── server/
│   ├── server.js           # Node.js server
│   ├── db.ts               # Database connection
│   ├── storage.ts          # Database operations
│   └── api.ts              # API endpoints
├── shared/
│   └── schema.ts           # Database schema
├── drizzle.config.json     # Drizzle ORM configuration
├── package.json            # Dependencies
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/adprofitx-compressor.git
   cd adprofitx-compressor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file
   echo "DATABASE_URL=your_postgresql_connection_string" > .env
   ```

4. **Set up the database**
   ```bash
   # Push database schema
   npx drizzle-kit push
   ```

5. **Start the server**
   ```bash
   node server/server.js
   ```

6. **Open your browser**
   Navigate to `http://localhost:5000`

## 🔧 Configuration

### Database Setup

The application uses PostgreSQL with Drizzle ORM. Update the `drizzle.config.json` file with your database credentials:

```json
{
  "schema": "./shared/schema.ts",
  "out": "./drizzle",
  "dialect": "postgresql",
  "dbCredentials": {
    "url": "your_database_url_here"
  }
}
```

### AdSense Integration

1. Update the AdSense code in `index.html`:
   ```html
   <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>
   ```

2. Update `ads.txt` with your publisher ID:
   ```
   google.com, pub-XXXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
   ```

## 📊 Database Schema

The application tracks comprehensive compression statistics:

- **compression_stats**: Individual file compression records
- **daily_analytics**: Aggregated daily statistics
- **user_sessions**: User activity tracking
- **processing_queue**: File processing queue management

## 🎨 Customization

### Styling
- Modify `styles.css` for visual customization
- Update color scheme in CSS variables
- Adjust responsive breakpoints as needed

### Functionality
- Add new compression formats in `script.js`
- Modify compression algorithms
- Add new API endpoints in `server/api.ts`

## 📈 Analytics

The application automatically tracks:

- Total compressions performed
- File sizes and compression ratios
- Popular output formats
- User activity and sessions
- Daily usage statistics

Access analytics through the `/api/stats` endpoint.

## 🔒 Security Features

- Client-side file processing (no files uploaded to server)
- Input validation and file type restrictions
- CORS configuration for API endpoints
- Environment variable protection for database credentials

## 🚀 Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy with automatic SSL and CDN

### Traditional Hosting

1. Upload files to your web server
2. Configure Node.js environment
3. Set up PostgreSQL database
4. Update database connection strings

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

If you have any questions or need help with setup:

- Create an issue in this repository
- Check the documentation in `replit.md`
- Review the code comments for implementation details

## ⭐ Features Roadmap

- [ ] WebP format optimization
- [ ] Batch download as ZIP
- [ ] Advanced PDF optimization options
- [ ] Image format conversion
- [ ] User accounts and history
- [ ] API rate limiting
- [ ] Advanced analytics dashboard

---

**Built with ❤️ for the web compression community**
