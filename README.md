# LeanCon Assignment

This project consists of a frontend React application and a backend FastAPI service for working with IFC models. The application allows visualization and analysis of IFC (Industry Foundation Classes) data.

## Table of Contents
- [Running with Docker (Recommended)](#running-with-docker-recommended)
- [Running Without Docker](#running-without-docker)
- [Project Structure](#project-structure)
- [Features](#features)

## Running with Docker (Recommended)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Git installed

### Step-by-Step Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd LeanCon-assignment
   ```

2. **Build and start the containers**
   ```bash
   # This command builds fresh images and starts the containers
   docker-compose up --build
   ```

   > **Note:** The first build will take several minutes as it needs to download and install all dependencies. Subsequent builds will be faster.

3. **Access the application**
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend API: [http://localhost:8000](http://localhost:8000)

4. **Stop the containers**
   ```bash
   # Press Ctrl+C in the terminal where docker-compose is running
   # Or run this in a new terminal:
   docker-compose down
   ```

### Troubleshooting Docker Setup

If you encounter issues with Docker:

1. **Ensure Docker Desktop is running**
   - Check for the Docker icon in your system tray/menu bar
   - Open Docker Desktop application if it's not running

2. **Force a completely fresh build**
   ```bash
   # Remove all containers, images, and volumes related to this project
   docker-compose down --rmi all --volumes
   
   # Build and start again
   docker-compose up --build
   ```

3. **Check Docker logs**
   ```bash
   docker-compose logs
   ```

4. **Verify network connectivity**
   - Make sure ports 5173 and 8000 are not being used by other applications

## Running Without Docker

If you prefer not to use Docker, you can run the frontend and backend separately.

### Backend Setup

1. **Navigate to the backend directory**
   ```bash
   cd backend
   ```

2. **Create a Python virtual environment**
   ```bash
   # Windows
   python -m venv venv
   
   # macOS/Linux
   python3 -m venv venv
   ```

3. **Activate the virtual environment**
   ```bash
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

4. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

5. **Run the FastAPI server**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

6. **Verify the backend is running**
   - Open [http://localhost:8000](http://localhost:8000) in your browser
   - You should see the FastAPI documentation

### Frontend Setup

1. **Open a new terminal and navigate to the frontend directory**
   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Access the frontend application**
   - Open [http://localhost:5173](http://localhost:5173) in your browser

## Project Structure

```
LeanCon-assignment/
├── backend/                # FastAPI backend
│   ├── app/                # Application code
│   │   ├── api/            # API routes
│   │   ├── core/           # Core configuration
│   │   ├── services/       # Business logic
│   │   └── main.py         # Entry point
│   ├── data/               # Data files
│   ├── ifc/                # IFC model files
│   └── requirements.txt    # Python dependencies
├── frontend/              # React frontend
│   ├── public/             # Static assets
│   ├── src/                # Source code
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   └── App.jsx         # Main application
│   ├── package.json        # Node.js dependencies
│   └── vite.config.js      # Vite configuration
└── docker-compose.yml     # Docker configuration
```

## Features

- 3D visualization of IFC models
- Detailed element information display
- Element quantity analysis with volume and length measurements
- Dynamic level-based filtering
- Interactive element selection and highlighting
