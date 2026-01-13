# WriteFlow

A modern, distraction-free writing editor built with React, TypeScript, and Supabase. WriteFlow provides a seamless writing experience with real-time collaboration, auto-save functionality, and cloud synchronization.

## Features

- **Distraction-Free Writing**: Clean, minimal interface focused on content creation
- **Auto-Save**: Never lose your work with automatic saving
- **Cloud Sync**: Access your documents from anywhere with cloud synchronization
- **Mobile Responsive**: Optimized experience across all devices
- **Rich Text Editing**: Powerful editor with formatting, tables, and media support
- **Export Options**: Export documents in multiple formats (DOCX, TXT)
- **Document Search**: Quickly find documents with powerful search functionality
- **Organization**: Star, archive, and tag your documents for better organization
- **Dark Mode**: Eye-friendly dark theme for extended writing sessions
- **Writing Analytics**: Word count, character count, and reading time tracking

## Quick Start

### Prerequisites

- Node.js 16+
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yemisi567/writeflow.git
   cd writeflow
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**

   ```bash
   cp env.example .env.local
   ```

   Update `.env.local` with your Supabase credentials:

   ```env
   REACT_APP_SUPABASE_URL=
   REACT_APP_SUPABASE_ANON_KEY=
   REACT_APP_ENCRYPTION_KEY=
   ```

4. **Database Setup**

   ```bash
   # Run the SQL script in your Supabase dashboard
   cat supabase-setup.sql
   ```

5. **Start development server**

   ```bash
   npm start
   # or
   yarn start
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## Screenshots

### Desktop Experience
<img width="1777" height="899" alt="Screenshot 2025-09-21 at 01 05 52" src="https://github.com/user-attachments/assets/5f7913e0-38cb-4d7a-a508-1e3d8b3fe5ef" />

## Tech Stack

### Frontend

- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **TipTap** - Rich text editor
- **React Router** - Navigation
- **React Hot Toast** - Notifications

### Backend & Database

- **Supabase** - Backend as a Service
- **PostgreSQL** - Database
- **Row Level Security (RLS)** - Data security

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Service Worker** - Offline support

## Project Structure

```
writeflow/
├── public/
│   ├── favicon.svg          # App favicon
│   ├── manifest.json        # PWA manifest
│   ├── sw.js               # Service worker
│   └── robots.txt          # SEO robots file
├── src/
│   ├── components/         # React components
│   │   ├── Editor/        # TipTap editor components
│   │   ├── Header/        # App header
│   │   ├── Sidebar/       # Document sidebar
│   │   ├── MobileSidebar/ # Mobile navigation
│   │   └── StatusBar/     # Bottom status bar
│   ├── config/            # Configuration files
│   ├── context/           # React context providers
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility libraries
│   └── utils/             # Helper functions
├── supabase-setup.sql     # Database schema
└── package.json
```

## Configuration

### Environment Variables

```env
REACT_APP_SUPABASE_URL=
REACT_APP_SUPABASE_ANON_KEY=
REACT_APP_ENCRYPTION_KEY=
```

## Contributing

I welcome contributions.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Style

- Use TypeScript for type safety
- Follow ESLint configuration
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [TipTap](https://tiptap.dev/) - Rich text editor
- [Supabase](https://supabase.com/) - Backend infrastructure
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework
- [Framer Motion](https://www.framer.com/motion/) - Animation library

## Support

- 📧 Email: alegbeyemi@gmail.com

---

<div align="center">
  <p>Built with ❤️ by Mojisola Alegbe</p>
  <p>
    <a href="https://mojisolaalegbe.com/">Website</a> •
    <a href="https://github.com/yemisi567">GitHub</a> •
    <a href="https://www.linkedin.com/in/mojisola-alegbe">Linkedin</a>
  </p>
</div>
