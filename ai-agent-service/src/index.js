const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send('AI Agent Service'));

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => console.log(`AI Agent Service on port ${PORT}`));
