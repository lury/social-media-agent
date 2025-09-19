FROM node:18

RUN apt-get update && apt-get install -y python3 python3-pip git
RUN pip3 install --break-system-packages langgraph-cli

WORKDIR /app
COPY . .

RUN npm config set registry https://registry.npmjs.org/
RUN npm install --verbose --no-optional

EXPOSE 54367
CMD ["npm", "run", "langgraph:in_mem:up"]
