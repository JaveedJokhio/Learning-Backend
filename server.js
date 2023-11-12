import mongoose from 'mongoose';
import express from 'express';
import path from 'path';
import axios from 'axios';
import bodyParser from 'body-parser';
import vm from 'vm'
import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';

const app = express();
const port = 4000;

// MongoDB configuration
const mongoDB = "mongodb://0.0.0.0:27017/";
mongoose.connect(mongoDB, {
  dbName: "backend",
})
  .then(() => console.log("DB Connected"))
  .catch((e) => console.log(e));

// Schema and model setup
const msgSchema = new mongoose.Schema({
  name: String,
  email: String,
});
const msg = mongoose.model("Message", msgSchema);

// Middlewares and settings
app.use(express.static(path.join(path.resolve(), "public")));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set("view engine", "ejs");

// Compile endpoint
app.post('/execute', (req, res) => {
  try {
    const code = req.body.code;
    const language = req.body.language;

    let result;

    if (language === 'javascript') {
      result = executeJavaScriptCode(code);
    } else if (language === 'cpp') {
      result = executeCppCode(code);
    } else {
      throw new Error('Unsupported language');
    }

    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

function executeJavaScriptCode(code) {
  try {
    const context = { console };
    const result = runInNewContext(code, context);

    return result;
  } catch (error) {
    return `Error: ${error.message}`;
  }
}

function executeCppCode(code) {
  try {
    // Write the C++ code to a temporary file
    const fileName = 'temp.cpp';
    writeFileSync(fileName, code, 'utf-8');

    // Compile the C++ code using g++
    const compileCommand = `g++ -o temp ${fileName}`;
    execSync(compileCommand);

    // Run the compiled executable
    const executeCommand = './temp';
    const result = execSync(executeCommand, { encoding: 'utf-8' });

    // Clean up the temporary files
    unlinkSync(fileName);
    unlinkSync('temp');

    return result.trim();
  } catch (error) {
    return `Error: ${error.message}`;
  }
}



// Other routes
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/add", async (req, res) => {
  await msg.create({ name: "Javi2", email: "javi2@gmail.com" })
  res.send("nice");
});

app.post("/contact", async (req, res) => {
  const msgData = { name: req.body.name, email: req.body.email };
  await msg.create(msgData);
  res.send("success");
});

app.get("/users", (req, res) => {
  res.json({
    users,
  });
  res.send("success");
});

// Start the server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
