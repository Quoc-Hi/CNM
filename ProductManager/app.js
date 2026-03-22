require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const routes = require('./routes/productRoute');
app.use('/', routes);

app.listen(3000, () => {
  console.log('http://localhost:3000');
});