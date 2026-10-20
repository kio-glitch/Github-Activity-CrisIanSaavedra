const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db, studentsCollection;

// Connect to MongoDB Atlas first, THEN start the server
async function startServer() {
  try {
    await client.connect();
    db = client.db('studentrecordsDB');
    studentsCollection = db.collection('students');
    console.log("Connected successfully to MongoDB Atlas!");

    // Start Express listener only after DB is fully ready
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}

// GET Route: Fetch all student records
app.get('/api/students', async (req, res) => {
  try {
    const students = await studentsCollection.find({}).toArray();
    res.json(students);
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch student records' });
  }
});

// POST Route: Add a new student record
app.post('/api/students', async (req, res) => {
  try {
    const { name, course, yearLevel } = req.body;
    
    if (!name || !course || !yearLevel) {
      return res.status(400).json({ error: 'All fields (name, course, yearLevel) are required' });
    }

    const newStudent = { 
      name: name.trim(), 
      course: course.trim(), 
      yearLevel: yearLevel.trim(), 
      createdAt: new Date() 
    };

    const result = await studentsCollection.insertOne(newStudent);
    
    res.status(201).json({ message: 'Student added successfully', studentId: result.insertedId });
  } catch (err) {
    console.error('Insert error:', err);
    res.status(500).json({ error: 'Failed to create student record' });
  }
});

// Initialize database connection and server startup
startServer();