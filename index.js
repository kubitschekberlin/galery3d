import express from 'express';
import path from 'path';
import { __dirname } from './files.js';

const app = express();
const port = 3001;

app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'node_modules', 'bootstrap', 'dist', 'css')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/*', (req, res) => {
  res.render('index', {title: '3D Galery 1.0'});
});

app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});
