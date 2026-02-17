# 🧠 DeepSeek Clone - Modern AI Chat Interface

A beautiful, modern clone of DeepSeek AI with enhanced UI/UX and robust API integration. Built with Next.js, Tailwind CSS, and powered by DeepSeek API.

**Created by [@MrAbhi2k3](https://github.com/MrAbhi2k3)**

## ✨ Features

- 🎨 **Modern UI/UX** - Sleek, responsive design with glass morphism effects
- 🧠 **DeepSeek AI Integration** - Powered by the latest DeepSeek API
- 🔐 **Authentication** - Secure user authentication with Clerk
- 💬 **Real-time Chat** - Smooth, streaming chat experience
- 📱 **Fully Responsive** - Perfect on all devices
- 🌙 **Dark Theme** - Beautiful dark interface with gradient backgrounds
- 📝 **Markdown Support** - Rich text formatting in responses
- 💾 **Chat History** - Save and manage conversations
- ⚡ **Fast Performance** - Optimized with Next.js 15 and Turbopack

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- MongoDB database
- DeepSeek API key
- Clerk account for authentication

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/MrAbhi2k3/DeepSeek-Clone.git
   cd deepseek
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```

   Update the `.env` file with:
   ```env
   # DeepSeek API
   DEEPSEEK_API_KEY=sk-your-deepseek-api-key-here
   
   # MongoDB
   MONGODB_URI=your_mongodb_connection_string
   
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Configuration

### Getting API Keys

1. **DeepSeek API**: Visit [DeepSeek Platform](https://platform.deepseek.com) to get your API key
2. **MongoDB**: Set up a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
3. **Clerk**: Create an account at [Clerk.dev](https://clerk.dev) for authentication

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DEEPSEEK_API_KEY` | Your DeepSeek API key | ✅ |
| `MONGODB_URI` | MongoDB connection string | ✅ |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | ✅ |
| `CLERK_SECRET_KEY` | Clerk secret key | ✅ |

## 📦 Tech Stack

- **Framework**: Next.js 15
- **Styling**: Tailwind CSS 4
- **Authentication**: Clerk
- **Database**: MongoDB with Mongoose
- **AI API**: DeepSeek API (OpenAI compatible)
- **UI Components**: Custom components with modern design
- **Animations**: CSS animations and transitions

## 🎨 UI/UX Features

- **Gradient Backgrounds**: Beautiful radial gradients
- **Glass Morphism**: Frosted glass effects throughout
- **Smooth Animations**: Fade-in, slide-in effects
- **Responsive Design**: Mobile-first approach
- **Interactive Elements**: Hover effects and transitions
- **Modern Typography**: Clean, readable fonts
- **Loading States**: Elegant loading animations

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app can be deployed on any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [DeepSeek](https://deepseek.com) for the amazing AI model
- [Clerk](https://clerk.dev) for authentication services
- [Tailwind CSS](https://tailwindcss.com) for the styling system

## 📧 Contact

**MrAbhi2k3** - [@MrAbhi2k3](https://github.com/MrAbhi2k3)

Project Link: [https://github.com/MrAbhi2k3/DeepSeek-Clone](https://github.com/MrAbhi2k3/DeepSeek-Clone)

---

⭐ **Star this repository if you found it helpful!**
