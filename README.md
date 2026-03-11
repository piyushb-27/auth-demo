# Jot 📝

A full-featured note-taking and document management app built with Next.js and MongoDB. Jot offers real-time auto-saving, folder and tag organization, pinned notes, and powerful search capabilities. It also includes secure file uploads for images and documents, letting you store and manage all your content in one place.

## 🌐 Live Demo

**[Try Jot Live →](https://auth-demo-black.vercel.app/login)**

## ✨ Features

### 🔐 Authentication
- Email-based signup with OTP verification
- Secure login with JWT tokens
- Profile management with avatar uploads

### 📝 Notes
- Create, edit, and delete notes with auto-save
- Rich text editing support
- Organize notes into folders
- Tag system for flexible categorization
- Pin important notes to the top
- Full-text search across all notes

### 📁 File Management
- Upload images (PNG, JPG, JPEG, WebP) and documents (PDF, TXT, MD)
- Drag & drop file uploads with progress indicator
- Preview files directly in the app
- Download and delete files
- Grid and list view options

### 🎨 User Experience
- Light and dark theme support
- Responsive design for all devices
- Smooth animations throughout
- Botanical-inspired design aesthetic

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT with HTTP-only cookies
- **File Storage:** UploadThing
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Icons:** Lucide React

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB database
- UploadThing account (for file uploads)
- Cloudinary account (for profile pictures)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/piyushb-27/auth-demo.git
cd auth-demo
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file with the following variables:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key

# Email (for OTP)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# UploadThing (for file uploads)
UPLOADTHING_TOKEN=your_uploadthing_token

# Cloudinary (for profile pictures)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
app/
├── api/              # API routes
│   ├── auth/         # Authentication endpoints
│   ├── notes/        # Notes CRUD operations
│   ├── folders/      # Folder management
│   ├── files/        # File operations
│   └── user/         # User profile
├── components/       # Reusable UI components
├── dashboard/        # Dashboard page
├── files/            # File management page
├── login/            # Login page
├── notes/            # Notes page
├── profile/          # Profile page
└── signup/           # Signup page

lib/                  # Utility functions and configs
models/               # Mongoose models
```

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
