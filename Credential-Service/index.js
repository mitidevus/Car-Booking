const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const authRoute = require('./routes/auth');
const accountRoute = require('./routes/account');

dotenv.config();
const app = express();

mongoose
    .connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log('Connected to MongoDB');
    });

app.use(cors());
app.use(cookieParser());
app.use(express.json());

// Routes
app.use('/v1/auth', authRoute);
app.use('/v1/account', accountRoute);

app.listen(process.env.PORT || 8050, () => {
    console.log(`Server is running on port ${process.env.PORT || 8050}`);
});
