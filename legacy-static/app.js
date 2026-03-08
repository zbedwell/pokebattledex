import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import cors from 'cors';
import db from './db.js';
import { fileURLToPath } from 'url';

const app = express();
const port = process.env.PORT || 3000;

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Default route for index.html
app.get('/', (request, response) => {
  response.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API routes
app.get('/pokemon', db.getPokemon);
app.post('/pokemon', db.addPokemon);

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
