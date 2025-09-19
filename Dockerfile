# Użyj image który ma już LangGraph
FROM python:3.11-slim

# Install Node.js
RUN apt-get update && apt-get install -y \
    curl \
    git \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g yarn \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install LangGraph CLI first
RUN pip install langgraph-cli

# Clone repo i install dependencies w jednym kroku (lepsze cache'owanie)
RUN git clone https://github.com/langchain-ai/social-media-agent.git . \
    && yarn install

# Expose port
EXPOSE 54367

# Create volume
VOLUME ["/app/data"]

# Start command
CMD ["yarn", "langgraph:in_mem:up"]
