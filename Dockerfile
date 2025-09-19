FROM node:18-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Use npm instead of yarn (sometimes more reliable in Docker)
RUN npm install --production=false

# Install LangGraph CLI
RUN pip3 install langgraph-cli

# Copy application code
COPY . .

# Expose the port
EXPOSE 54367

# Create a volume for persistent data
VOLUME ["/app/data"]

# Start the LangGraph server
CMD ["npm", "run", "langgraph:in_mem:up"]
