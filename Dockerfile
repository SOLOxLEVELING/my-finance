# --- Stage 1: Build the React application ---
    FROM node:18-alpine AS builder

    WORKDIR /app
    
    COPY package*.json ./
    RUN npm install
    
    COPY . .
    # This runs the 'npm run build' script from your package.json
    RUN npm run build
    
    # --- Stage 2: Serve the built application with Nginx ---
    FROM nginx:stable-alpine
    
    # Copy only the built static files from the 'builder' stage
    COPY --from=builder /app/dist /usr/share/nginx/html
    
    # Tell Docker that the container will listen on port 80
    EXPOSE 80
    
    # The command to start the Nginx server when the container starts
    CMD ["nginx", "-g", "daemon off;"]