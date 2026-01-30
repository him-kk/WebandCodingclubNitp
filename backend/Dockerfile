FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache dumb-init \
  && addgroup -g 1001 -S nodejs \
  && adduser -S nodejs -u 1001

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY . .

RUN mkdir -p uploads && chown -R nodejs:nodejs /app

USER nodejs

# EXPOSE is optional on Railway, but keep it generic
EXPOSE 8080

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
