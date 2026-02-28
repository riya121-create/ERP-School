import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Subject from '../src/models/Subject.js';

// Load environment
dotenv.config();

// Sample subjects data
const sampleSubjects = [
  {
    name: "Mathematics",
    code: "MATH",
    type: "core",
    department: "Science",
    description: "Advanced mathematics including algebra, geometry, calculus",
    credits: 5
  },
  {
    name: "Physics",
    code: "PHY",
    type: "core",
    department: "Science",
    description: "Fundamental physics including mechanics, thermodynamics",
    credits: 5
  },
  {
    name: "Chemistry",
    code: "CHEM",
    type: "core",
    department: "Science",
    description: "Organic and inorganic chemistry",
    credits: 5
  },
  {
    name: "Biology",
    code: "BIO",
    type: "core",
    department: "Science",
    description: "Botany, zoology and life sciences",
    credits: 5
  },
  {
    name: "English",
    code: "ENG",
    type: "core",
    department: "Languages",
    description: "English language and literature",
    credits: 4
  },
  {
    name: "Hindi",
    code: "HIN",
    type: "core",
    department: "Languages",
    description: "Hindi language and literature",
    credits: 4
  },
  {
    name: "Computer Science",
    code: "CS",
    type: "core",
    department: "Computer Science",
    description: "Programming, algorithms, and computer fundamentals",
    credits: 5
  },
  {
    name: "History",
    code: "HIST",
    type: "core",
    department: "Social Studies",
    description: "World history and civics",
    credits: 4
  },
  {
    name: "Geography",
    code: "GEO",
    type: "core",
    department: "Social Studies",
    description: "Physical and human geography",
    credits: 4
  },
  {
    name: "Physical Education",
    code: "PE",
    type: "practical",
    department: "Sports",
    description: "Sports, fitness and physical activities",
    credits: 2
  },
  {
    name: "Art",
    code: "ART",
    type: "elective",
    department: "Fine Arts",
    description: "Drawing, painting and visual arts",
    credits: 3
  },
  {
    name: "Music",
    code: "MUS",
    type: "elective",
    department: "Fine Arts",
    description: "Vocal and instrumental music",
    credits: 3
  }
];

async function createSubjects() {
  try {
    console.log('Connecting to MongoDB...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB successfully');

    // Clear existing subjects
    await Subject.deleteMany({});
    console.log('Cleared existing subjects');

    // Insert sample subjects
    const insertedSubjects = await Subject.insertMany(sampleSubjects);
    console.log(`Created ${insertedSubjects.length} subjects:`);
    
    insertedSubjects.forEach((subject, index) => {
      console.log(`${index + 1}. ${subject.name} (${subject.code}) - ${subject.department}`);
    });

    console.log('Subjects created successfully!');
    
  } catch (error) {
    console.error('Error creating subjects:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the function
createSubjects();
