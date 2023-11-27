import mongoose from 'mongoose';
import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';

const app = express();
const port = process.env.PORT || 4000;

// MongoDB configuration
const mongoDB = "mongodb://0.0.0.0:27017/";
mongoose.connect(mongoDB, {
  dbName: "backend",
})
  .then(() => console.log("DB Connected"))
  .catch((e) => console.log(e));


// Schema and model setup
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password:String,
}); 
const User = mongoose.model("User", userSchema);
  
// Middlewares and settings
app.use(express.static(path.join(path.resolve(), "public")));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.set("view engine", "ejs");

// autheticate handler
const isAuthenticated = async (req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    const decoded = jwt.verify(token,"All is well")
     req.user = await User.findById(decoded._id)
    next()
  } else {
    res.redirect("/login");
  }
};

// Other routes
app.get("/", isAuthenticated, (req, res) => {
res.render("logout",{name:req.user.name})
});
app.get("/register", (req, res) => {
  res.render("register")
  });
app.get("/login", (req, res) => {
  res.render("login", { message: "" }); 
  });    

app.post("/login",async(req,res)=>{
 const {email,password} = req.body;

  let user = await User.findOne({email});
  if(!user) return res.redirect("/register");
 
  const isMatched = user.password === password;
  if (!isMatched) {
    res.render("login", { message: "Incorrect password" });
    return; // Add this line to exit the function
  } 
  
  const token = jwt.sign({ _id: user._id }, "All is well");
  
  res.cookie("token", token, {
    httpOnly: true, expires: new Date(Date.now() + 10 * 1000),
  });
  
  res.redirect('/');
  

    
})
app.post('/register',async (req, res) => {
 const {name,email,password} = req.body

  let user = await User.findOne({email})

  if(user){
    return res.redirect("/login")
    
  }

   user = await User.create({
    name,email,password
  })
  const token = jwt.sign({_id:user._id},"All is well")
 

  res.cookie("token", token, {
    httpOnly: true, expires: new Date(Date.now() + 10 * 1000)
  });

  res.redirect('/')
})
app.get('/logout', (req, res) => {
  res.cookie("token", null, {
    httpOnly: true, expires: new Date(Date.now())
  });

  res.redirect('/')
})

// Start the server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
