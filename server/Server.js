const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

// Import Models
const User = require('./models/User.Model');

// Bind Routes
const UserRoutes = require('./routes/User.Routes');

app.use('/api/users', UserRoutes);

// Connect to MongoDB Database
const uri = process.env.ATLAS_URI;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const userRoutes = require('./routes/User.Routes');

const connection = mongoose.connection;
connection.once('open', () => {
    console.log("MongoDB database connection established successfully!");
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});