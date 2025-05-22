import express from 'express';
import lineRouter from './routes/lineRoutes';
import 'dotenv/config';

const app = express();
const port = 3000;

app.use(express.json());
app.use('/api/lines', lineRouter);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})