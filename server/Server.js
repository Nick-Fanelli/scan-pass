const express = require('express');
const mongoose = require('mongoose');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

app.use(cors());

// Get Route Routers
const UserRoutes = require('./routes/User.Routes');
const SchoolLocationRoutes = require('./routes/SchoolLocations.Routes');
const PassRoutes = require('./routes/Pass.Routes');

app.get('/test', (req, res) => {
    res.send("This is a test!");
});

// Bind Routes Middleware
app.use('/api/users', UserRoutes);
app.use('/api/school-locations', SchoolLocationRoutes);
app.use('/api/passes/', PassRoutes);

// Connect to MongoDB Database
const uri = process.env.ATLAS_URI;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const connection = mongoose.connection;
connection.once('open', () => {
    console.log("MongoDB database connection established successfully!");
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});