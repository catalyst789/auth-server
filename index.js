require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

app.use(require('cors')())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/** connect to mongoose */
mongoose
  .connect("mongodb://127.0.0.1:27017")
  .then(() => {
    console.log("db configured");
  })
  .catch((err) => console.log(err));

const userSchema = new mongoose.Schema({ email: String, password: String });
const userModel = mongoose.model("user", userSchema);

app.get("/health", (req, res) => {
  res.status(200).json({ message: "Up & Running" });
});

app.post("/singin", async (req, res) => {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email });
  if (!user) return res.status(404).json({ message: "user not found" });
  if(password !== user.password) return res.status(401).json({message: 'Wrong password'});
  const token = jwt.sign({ email, password }, process.env.JWT_SECRET, {expiresIn: 60});
  res.status(200).json({message: 'success', token});
});

const isAuthenticated = (req, res, next) => {
    try {    
        const token = req.headers.token;
        if(!token) return res.status(401).json({message: 'Unauthorized'});
        const verify = jwt.verify(token, process.env.JWT_SECRET);
        console.log("verify: ", verify);
        if(!verify) return res.status(401).json({message: 'Unauthorized'});
        next();
    } catch (error) {
        return res.status(401).json({message: 'Unauthorized'})
    }
}

app.get('/home', isAuthenticated, (req, res) => {
    return res.status(200).json();
})

app.listen(process.env.PORT, () =>
  console.log(`Server is running at ${process.env.PORT}`)
);
