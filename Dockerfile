FROM python:3.11-slim

ENV DEBIAN_FRONTEND=noninteractive

WORKDIR /app

# Install Node.js z oficjalnych binaries (ominięcie NodeSource)
RUN apt-get update && apt-get install -y \
    curl \
    git \
    xz-utils \
    && curl -fsSL https://nodejs.org/dist/v18.20.4/node-v18.20.4-linux-x64.tar.xz -o node.tar.xz \
    && tar -xf node.tar.xz --strip-components=1 -C /usr/local \
    && rm node.tar.xz \
    && npm install -g yarn \
    && rm -rf /var/lib/apt/lists/*

# Install LangGraph CLI
RUN pip install langgraph-cli

# Clone repo and install dependencies
RUN git clone https://github.com/langchain-ai/social-media-agent.git . \
    && yarn install

EXPOSE 54367
VOLUME ["/app/data"]
CMD ["yarn", "langgraph:in_mem:up"]
