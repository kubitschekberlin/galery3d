import express from 'express';
import { Handlebars } from 'handlebars'
import { create } from'express-handlebars';
import path from 'path';
import { __dirname } from './files.js';

const app = express();
const port = 3001;

app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));

// Setze Handlebars als Template-Engine
const hbs = create({handlebars: Handlebars});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});
