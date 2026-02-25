FROM node:20-slim

# Install gcc and python3 for code execution
RUN apt-get update && apt-get install -y \
  gcc \
  python3 \
  python3-pip \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .

EXPOSE 5000
CMD ["node", "src/index.js"]
