require('dotenv').config();
let express = require('express');
let db = require('./db');
let bodyParser = require('body-parser');
let app = express();
let admin = require('./middleware/admincreate');

db.sync();
app.use(require('./middleware/headers'));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));

app.use('/user', require('./controllers/usercontroller'));
app.use('/posts', require('./controllers/eventcontroller'))
app.use('/budget', require('./controllers/documentcontroller'));
app.use(require('./middleware/validate-session'));
app.use('/admin', require('./controllers/admincontroller'));

app.listen(process.env.PORT, function () {
    console.log(`App is listening on ${process.env.PORT}`);
    admin();
})