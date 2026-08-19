FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Revert the dynamic removal we just did
RUN sed -i 's|// export const dynamic|export const dynamic|g' src/app/layout.tsx src/app/eventos/page.tsx

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
