# ===========================
# 📦 1️⃣ Build stage: React app
# ===========================
FROM node:16-alpine AS build

# Set working directory
WORKDIR /app

# Copy dependency files and install
COPY package*.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# ✅ Copy environment file generated from Vault (if exists)
# This line ensures that .env from your initContainer or CI is present
COPY .env .env

# ✅ Build the React app with env variables baked in
RUN npm run build


# ===========================
# 🌐 2️⃣ Production stage: Serve via NGINX
# ===========================
FROM nginx:alpine

# Set working directory for nginx static files
WORKDIR /usr/share/nginx/html

# ✅ Copy compiled React build
COPY --from=build /app/build /usr/share/nginx/html

# Optional: remove default nginx config (so you can mount your own later)
RUN rm -rf /etc/nginx/conf.d/default.conf

# ✅ Copy your custom Nginx config if you have one (optional)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for web traffic
EXPOSE 80

# ✅ Start nginx
CMD ["nginx", "-g", "daemon off;"]
