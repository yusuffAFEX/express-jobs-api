require('dotenv').config();
require('express-async-errors');
const express = require('express');
const app = express();
const treblle = require('@treblle/express')


// extra security
const helmet = require('helmet')
const cors = require('cors')
const xss = require('xss-clean')
const rateLimiter = require('express-rate-limit')

// Swagger
const swaggerUI =require('swagger-ui-express')
const YAML = require('yamljs')
const swaggerDocument = YAML.load('./swagger.yaml')

//connectDB
const connectDB = require('./db/connect')

//routes
const authRouter = require('./routes/auth')
const jobsRouter = require('./routes/jobs')
const authenticatedUser = require('./middleware/authentication')

// error handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

app.set('trust proxy', 1)
app.use(rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windows
}))
app.use(express.json());

app.use(treblle())

// extra packages
app.use(helmet())
app.use(cors())
app.use(xss())

app.get('/', (req, res)=>{
  res.send('<h1>Jobs API</h1><a href="/api-docs">Documentation</a>')
})
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument))

// routes
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/jobs', authenticatedUser, jobsRouter)

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI)
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
