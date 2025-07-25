FROM node:20-slim
# Optimize npm and ensure dev dependencies are installed
ENV NODE_ENV=development
ENV NPM_CONFIG_LOGLEVEL=error
ENV NPM_CONFIG_FUND=false
ENV NPM_CONFIG_AUDIT=false

WORKDIR /app

# Copy package.json and lockfile to enable fast deterministic install
COPY package*.json ./

# Install all deps (including dev) using clean install
# Use npm install instead of npm ci to ensure binaries are properly linked
RUN npm install

# Copy the rest of the app
COPY . .

EXPOSE 5173

# Start Vite in dev mode
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
