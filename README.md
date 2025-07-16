# ♟️ ChessVerse

**ChessVerse** is a modern, full-stack multiplayer chess platform powered by React, TypeScript, and Spring Boot. It offers seamless real-time gameplay, social interaction, and powerful user customization — designed for players of all levels.

---

## 🎮 Features

### 🤖 AI & Analysis
- Stockfish chess engine integration
- Real-time move analysis and grading
- Post-game analysis with accuracy metrics
- AI hint system for practice mode
- Mistake detection and improvement suggestions

### 💬 Communication
- Real-time in-game chat via WebSocket
- Message history and timestamps
- Clean, expandable chat interface


### 🕹️ Gameplay
- Real-time multiplayer chess via WebSockets
- Full rule support: check, checkmate
- Advanced move validation and hint system
- Special moves: castling, en passant, pawn promotion
- PGN move history and replay
- Time control with adjustable clocks
- Resign and draw support

### 👥 User Features
- Secure user authentication (JWT-based)
- Profiles with stats and match history
- Dynamic ELO rating system
- Add friends and invite to private games
- Unlockable themes and achievements

### 🌍 Social & Spectator Features
- In-game and private messaging
- Live game spectator mode
- Global leaderboards and tournament hosting
- Game sharing (PGN or visual replay)
- Forums and discussions (planned)

### ⚙️ Technical Highlights
- WebSocket-based real-time synchronization
- Responsive Tailwind CSS UI with dark/light themes
- Mobile-first and offline-ready design
- Fully secured REST & WebSocket API
- Modular, clean codebase for scalability

---

## 🧱 Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Redux Toolkit (state management)
- React Router (routing)
- Axios (HTTP)
- Jest + React Testing Library

### Backend
- Spring Boot 3.2
- Java 17
- MongoDB + Spring Data MongoDB
- Spring Security + JWT
- WebSocket
- Spring WebFlux
- JUnit + Mockito

---

## 🚀 Getting Started

### 🧩 Prerequisites
- Node.js v16+
- Java 17+
- MongoDB
- Maven
- Git

---

### **Install Stockfish:**
```bash
# Windows
# 1. Download from https://stockfishchess.org/download/
# 2. Extract to C:\stockfish\
# 3. Ensure stockfish-windows-x86-64-avx2.exe is in the folder

# Ubuntu/Debian
sudo apt-get install stockfish

# macOS
brew install stockfish
```

### **Configure Stockfish Path:**
Update the Stockfish path in `application.properties`:
```properties
# Windows (default)
stockfish.path=C:\\stockfish\\stockfish-windows-x86-64-avx2.exe

# Linux
stockfish.path=/usr/bin/stockfish

# macOS
stockfish.path=/opt/homebrew/bin/stockfish
```

### Frontend Setup
1. Navigate to the Frontend directory:
   ```bash
   cd FrontEnd
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Backend Setup
1. Navigate to the Backend directory:
   ```bash
   cd BackEnd
   ```

2. Build the project:
   ```bash
   mvn clean install
   ```

3. Run the application:
   ```bash
   mvn spring-boot:run
   ```

## 🔧 Configuration

### Frontend
- Environment variables are configured in `.env` file
- Tailwind CSS configuration in `tailwind.config.js`
- TypeScript configuration in `tsconfig.json`


### Backend
- Application properties in `src/main/resources/application.properties`
- MongoDB connection settings
- JWT configuration
- WebSocket endpoints
- CORS and security setup


## 📁 Project Structure

### Frontend
```
FrontEnd/
├── src/
│   ├── assets/           # Images, sounds, etc.
│   ├── components/       # UI & logic components
│   ├── game/             # Chess board & game logic
│   ├── pages/            # Routing views
│   ├── services/         # API & socket services
│   ├── store/            # Redux slices
│   ├── types/            # Custom TypeScript types
│   ├── utils/            # Helper functions
│   └── hooks/            # Custom React hooks
├── public/
└── package.json

```

### Backend
```
BackEnd/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   ├── controllers/    # REST controllers
│   │   │   ├── models/         # Entities and DTOs
│   │   │   ├── services/       # Game & user logic
│   │   │   ├── repositories/   # MongoDB repositories
│   │   │   ├── websocket/      # WebSocket config & handlers
│   │   │   ├── security/       # JWT, auth config
│   │   │   └── config/         # App-wide configs
│   └── resources/
│       ├── application.properties
├── test/
└── pom.xml

```

## 🔐 Security

-Password hashing with BCrypt
-JWT-based authentication
-CORS and CSRF protection
-Secure WebSocket origin validation
-XSS and SQL injection mitigation
-Rate limiting and input validation

## 🧪 Testing

### Frontend
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

### Backend
```bash
# Unit tests
mvn test

# Integration tests
mvn verify

# Coverage report
mvn jacoco:report
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style
- Write unit tests for new features
- Update documentation as needed
- Use meaningful commit messages
- Keep pull requests focused and small

## 📧 Contact

For any questions or concerns, please open an issue in the repository.

## 🔄 Updates and Roadmap

### Planned Features
- AI opponent with adjustable difficulty
- Tournament system
- Advanced analytics
- Mobile app version
- Voice chat integration
- Custom game variants
- Training mode with puzzles
- Video streaming integration