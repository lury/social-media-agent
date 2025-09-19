FROM node:18-slim

ENV DEBIAN_FRONTEND=noninteractive

WORKDIR /app

# Install Python dla LangGraph CLI
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install LangGraph CLI
RUN pip3 install langgraph-cli

# Clone repo and install dependencies
RUN git clone https://github.com/langchain-ai/social-media-agent.git . \
    && yarn install

EXPOSE 54367
VOLUME ["/app/data"]
CMD ["yarn", "langgraph:in_mem:up"]
