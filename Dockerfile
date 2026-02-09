FROM node:20-bookworm

WORKDIR /app

# copy package files ก่อน
COPY package.json  ./

# copy source code
COPY . .

# สร้าง folder ที่อาจไม่อยู่ใน git
RUN mkdir -p media public \
  && chown -R node:node /app

RUN npm install

# build evershop
RUN npm run build

EXPOSE 80

USER node

CMD ["npm", "run", "start"]
