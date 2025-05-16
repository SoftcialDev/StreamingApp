# 🎥 Streaming Application Monorepo

This monorepo hosts a real-time streaming application comprising:

* **Frontend**: Built with React, Tailwind CSS, and Vite.
* **Backend**: Developed using Express.js, integrating Amazon Kinesis Video Streams and Redis.
* **Machine Learning**: Incorporates TensorFlow for motion detection, with plans for posture recognition using a separate Python service.
* **Monorepo Management**: Managed using Turborepo for efficient builds and task running.

---

## 🗂️ Project Structure

```plaintext
streaming-app/
├── apps/
│   ├── frontend/       # React + Tailwind CSS (Vite)
│   └── backend/        # Express.js API with Kinesis and Redis
├── packages/           # Shared utilities and configurations
├── docker/             # Docker configurations
├── .gitignore
├── package.json
├── turbo.json
└── README.md
```



---

## 🚀 Getting Started

### Prerequisites

* **Node.js** (v16 or higher)
* **npm** (v7 or higher)
* **Docker** (for local Redis and future Python ML services)([docs.gitlab.com][1], [GitHub][2])

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/yourusername/streaming-app.git
   cd streaming-app
   ```



2. **Install dependencies**:

   ```bash
   npm install
   ```


3. **Set up environment variables**:

   Create `.env` files in both `apps/frontend` and `apps/backend` directories with the necessary configurations.

---

## 🧪 Development

To start the development servers for both frontend and backend:

```bash
npm run dev
```



This will concurrently run:

* **Frontend**: Accessible at `http://localhost:5173`
* **Backend**: Accessible at `http://localhost:3001`

---

## 🏗️ Building for Production

To build both applications:

```bash
npm run build
```



To start the backend server:

```bash
npm run start
```



---

## 🐳 Docker Setup

For local development with Redis:

```bash
docker run --name redis-local -p 6379:6379 -d redis
```



Ensure that the backend connects to the correct Redis instance based on the environment (local or AWS).


## 🧠 Machine Learning Integration(To be implemented)

* **Motion Detection**: Implemented using TensorFlow\.js within the frontend.
* **Posture Recognition**: Planned using a separate Python application with TensorFlow, communicating with the backend via API endpoints.


## 📦 Turborepo Scripts

* `dev`: Runs both frontend and backend in development mode.
* `build`: Builds both applications for production.
* `start`: Starts the backend server.
* `clean`: Cleans build artifacts.([Distributed][3], [Reddit][4], [help.tempo.io][5])

