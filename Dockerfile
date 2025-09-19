# Multi-stage build for better caching and smaller final image
FROM node:18-slim as builder

ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install LangGraph CLI globally
RUN pip3 install --break-system-packages langgraph-cli

# Set working directory
WORKDIR /app

# Clone and build the application
RUN git clone https://github.com/langchain-ai/social-media-agent.git . \
    && yarn install --frozen-lockfile --network-timeout 300000

# Final production image
FROM node:18-slim

ENV DEBIAN_FRONTEND=noninteractive

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Install LangGraph CLI
RUN pip3 install --break-system-packages langgraph-cli

WORKDIR /app

# Copy built application from builder stage
COPY --from=builder /app .

# Create volume for persistent data
VOLUME ["/app/data"]

# Expose port
EXPOSE 54367

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:54367/health || exit 1

# Start the application
CMD ["yarn", "langgraph:in_mem:up"]
