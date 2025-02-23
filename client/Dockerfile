FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Set environment variables
ENV NODE_ENV=development

# Expose port 3000
EXPOSE 3000

# Start the application in development mode
CMD ["npm", "start"]
