import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import router from './routes/Route.js';
import bodyParser from 'body-parser';
import cors from 'cors';

dotenv.config();
const app = express();

app.use(cors({ credentials:true, origin:'http://127.0.0.1:3000' }));
app.use(cookieParser());
app.use(express.json());
app.use(router);
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(5000, () => console.log('Server is running on port 5000'));