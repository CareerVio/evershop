FROM node:18-alpine

WORKDIR /app

# copy package files ก่อนเพื่อ cache
COPY package.json package-lock.json ./

# copy source code
COPY . .

# สร้าง folder ที่อาจไม่อยู่ใน git
RUN mkdir -p media public \
  && chown -R node:node /app

RUN npm ci --production

# build evershop
RUN npm run build

ENV PORT=3000
EXPOSE 3000

USER node

CMD ["npm", "run", "start"]
