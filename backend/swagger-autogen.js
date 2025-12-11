import swaggerAutogen from 'swagger-autogen';

const host = process.env.SERVER_URL
  ? `${process.env.SERVER_URL}:${process.env.PORT}`
  : 'localhost:3000';

const doc = {
  info: {
    title: 'Coworking API',
    description: 'Автоматически сгенерированная документация',
  },
  host: host,
  schemes: ['http', 'https'],  
};

const outputFile = './swagger-output.json';
const routes = ['./src/server.js'];

swaggerAutogen()(outputFile, routes, doc);
