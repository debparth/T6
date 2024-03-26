const express = require('express');
const bodyParser = require('body-parser');
const serverless = require('serverless-http');
const mongoose = require('mongoose');


const app = express();
const port = process.env.PORT || 3000;
app.use(bodyParser.json());


const mongoUri = 'mongodb+srv://parthmehta2017:8WKyY9uBlUqspr8Z@general-cluster.ucrxkhu.mongodb.net/CSCI5709_W24_T7?retryWrites=true&w=majority&appName=General-Cluster';
mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB connection established'))
  .catch(err => console.error('MongoDB connection error:', err));


const userSchema = new mongoose.Schema({
  email: String,
  firstName: String
}, { versionKey: false });

const User = mongoose.model('User', userSchema);



app.get('/', (req, res) => {
  res.send('Application is running...');
});

app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json({ message: "Users retrieved", success: true, users });
  } catch (error) {
    console.error('GET /users error:', error);
    res.status(500).json({ message: "An error occurred", success: false });
  }
});

app.post('/add', async (req, res) => {
  try {
    const { email, firstName } = req.body;
    const newUser = new User({ email, firstName });
    await newUser.save();
    res.status(201).json({ message: "User added", success: true });
  } catch (error) {
    console.error('POST /add error:', error);
    res.status(500).json({ message: "An error occurred", success: false });
  }
});

app.put('/update/:_id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email, firstName } = req.body;
    const updatedUser = await User.findOneAndUpdate({ id }, { email, firstName }, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found.", success: false });
    }
    res.json({ message: "User updated", success: true });
  } catch (error) {
    console.error('PUT /update/:id error:', error);
    res.status(500).json({ message: "An error occurred", success: false });
  }
});

app.delete('/delete/:_id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findOneAndDelete({ id });
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found.", success: false });
    }
    res.json({ success: true, message: "User deleted" });
  } catch (error) {
    console.error('DELETE /delete/:id error:', error);
    res.status(500).json({ message: "An error occurred", success: false });
  }
});

app.get('/user/:_id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ id });
    if (!user) {
      return res.status(404).json({ message: "User not found.", success: false });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error('GET /user/:id error:', error);
    res.status(500).json({ message: "An error occurred", success: false });
  }
});


app.use((err, req, res, next) => {
  console.error('Global error handler:', err.stack);
  res.status(500).json({ message: "An unexpected error occurred.", success: false });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

module.exports.handler = serverless(app);
