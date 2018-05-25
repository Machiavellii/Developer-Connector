const express = require('express');
const mongoose = require('mongoose');

const users = require('./routes/api/users')
const profile = require('./routes/api/profile')
const posts = require('./routes/api/post')

const app = express();

//DataBase Config
const db = require('./config/keys').mongoURI;

//Connect to MongoDB
mongoose
    .connect(db)
    .then(() => console.log('MongoDB Connection'))
    .catch(err => console.log(err));
    

app.get('/', (req, res) => res.send('Hello!'));

const port = process.env.PORT || 5000;


//Users Routes
app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/post', posts);


app.listen(port, () => console.log(`Server running ${port}`));