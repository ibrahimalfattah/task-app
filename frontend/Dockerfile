# ===========================
# 📦 1️⃣ Build stage: React app
# ===========================
FROM node:16-alpine AS build

# Set working directory
WORKDIR /app
#ARG REACT_APP_API_URL
#ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Copy dependency files and install
COPY package*.json ./
RUN npm install

# Copy the rest of the app
COPY . .

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


# Expose port 80 for web traffic
EXPOSE 80

# ✅ Start nginx
CMD ["nginx", "-g", "daemon off;"]
