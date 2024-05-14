import express from "express"
import indexRouter from './routes/index';
require('dotenv').config()

const port = process.env.EXPRESS_PORT || 3001

const app = express();

app.use(express.json());


app.use('/', indexRouter);


// catch 404
app.use((req, res, next) => {
    const err = new Error('Not Found') as any;
    err.status = 404;
    next(err);
});

// error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.status(err.status || 500);
    res.render('error');
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});