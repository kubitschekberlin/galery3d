import express from 'express';
import pkg from 'handlebars'
import { create } from'express-handlebars';
import path from 'path';
import { __dirname } from './files.js';

const app = express();
const port = 3001;

app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));

// Setze Handlebars als Template-Engine
const hbs = create({
  handlebars: pkg,
  partialsDir: __dirname + '/views/partials',
  defaultLayout: false,
  compilerOptions: {}
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');

app.get('/*', (req, res) => {
  //res.sendFile(path.join(__dirname, 'views/index.html'));
  res.render('main', {});
});

app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});
