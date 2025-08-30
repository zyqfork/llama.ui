# ------------------------------------------------------------------
#  Stage 1 – Build the React application
# ------------------------------------------------------------------
# Use the official Node image (alpine for a small footprint)
FROM node:lts-alpine AS build

# Create /app directory in the container
WORKDIR /app

# Copy package.json & package-lock.json (or yarn.lock) first
# so Docker can cache the npm install step.
COPY package*.json ./

# Install dependencies (npm ci is deterministic and fast)
RUN npm ci --silent

# Copy the rest of the source code
COPY . .

# Build the React app – creates ./build directory
RUN npm run build:prod

# ------------------------------------------------------------------
# Stage 2 – Serve the build with nginx
# ------------------------------------------------------------------
FROM nginx:alpine as webui

# Copy the build folder from the previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 – the default HTTP port
EXPOSE 80

# Start nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
