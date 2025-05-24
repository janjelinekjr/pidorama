import express from 'express';
import lineRouter from './routes/lineRoutes';

const app = express();

app.use(express.json());
app.use('/api/v1/lines', lineRouter);

export default app;
