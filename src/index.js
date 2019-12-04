const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

//initialization
const app = express();

//database
require('./database');

//midlewares
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

//habilitar carpeta public
app.use(express.static(path.join(__dirname, 'public')));

//global routes
app.use(require('./routes/index'));

//server
app.listen(3000, () => {
    console.log('Listen port', 3000);
});