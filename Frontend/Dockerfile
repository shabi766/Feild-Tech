FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN echo "Starting build..."
RUN npm run build
RUN echo "Build completed."

RUN echo "Listing /app/dist:"
RUN ls -al /app/dist

RUN echo "Listing /app:"
RUN ls -al /app

EXPOSE 3000

CMD ["sh", "-c", "cd /app && npm run preview --host 0.0.0.0 --port 3000"]