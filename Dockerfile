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
COPY yarn.lock* ./

# Configure yarn for better network handling
RUN yarn config set network-timeout 300000
RUN yarn config set registry https://registry.npmjs.org/

# Install Node dependencies with retries
RUN yarn install --network-timeout 300000 --frozen-lockfile

# Install LangGraph CLI
RUN pip3 install langgraph-cli

# Copy application code
COPY . .

# Expose the port
EXPOSE 54367

# Create a volume for persistent data
VOLUME ["/app/data"]

# Start the LangGraph server
CMD ["yarn", "langgraph:in_mem:up"]
