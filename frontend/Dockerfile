FROM node:20-alpine

WORKDIR /app

# Install dependencies first (cached layer)
COPY package*.json ./
RUN npm install

# Copy application source
COPY . .

# The scroll-frames directory is part of public/ and will be
# copied with the COPY . . above.  If it was .dockerignore'd,
# uncomment the next line:
# COPY public/scroll-frames/ public/scroll-frames/

EXPOSE 5173

CMD ["npm", "run", "dev"]
