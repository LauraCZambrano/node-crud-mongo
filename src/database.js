const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1/cafe', {
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    useNewUrlParser: true,
})
    .then(db => console.log('DB is connected'))
    .catch(err => console.log(err));