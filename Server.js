import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config({
  path:'./.env'
});

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin:"https://hospital-managment-roan.vercel.app/"
}));
app.use(bodyParser.json());
app.get('/', (req, res) => {
  res.send('Hello World!');
});
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('MongoDB connection error:', error);
});

const formDataSchema = new mongoose.Schema({
  Name: String,
  gender: String,
  email: String,
  mobno: String,
  address: String,
  disease: String,
  date: String,
});
const FormDataModel = mongoose.model('FormData', formDataSchema);
app.post('/api/submitFormData', async (req, res) => {
  const formData = new FormDataModel(req.body);
  try {
    await formData.save();
    res.status(200).json({ message: 'Form data saved successfully' });
  } catch (error) {
    console.error('Error saving form data:', error);
    res.status(500).json({ error: 'Error saving form data' });
  }
});

const newSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const collection = mongoose.model('collection', newSchema);

app.post('api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const check = await collection.findOne({ email: email, password: password });
    if (check) {
      if(password)
      res.json('exist');
    } else {
      res.json('notexist');
    }
  } catch (e) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('api/signup', async (req, res) => {
  const { email, password } = req.body;
  const data = {
    email: email,
    password: password,
  };
  try {
    const check = await collection.findOne({email:email});
    if (check) {
      res.json('exist');
    }else {
      await collection.create(data);
      res.json('notexist');
    }
  } catch (e) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/api/appointmentsCount', async (req, res) => {
  const { date } = req.query;

  try {
    const count = await FormDataModel.countDocuments({ date });
    res.status(200).json({ count });
  } catch (error) {
    console.error('Error fetching appointments count:', error);
    res.status(500).json({ error: 'Error fetching appointments count' });
  }
});

app.listen(8000, () => {
  console.log('Server is running on port 8000');
});
