//jshint esversion:6

const express = require("express");
const ejs = require("ejs");
const _ =require('lodash');
const mongoose =require('mongoose');
const session=require('express-session')
const mongoDBsession=require('connect-mongodb-session')(session)
const userModel=require('./models/user');
const bcrypt=require('bcryptjs')

const homeStartingContent = "Welcome to the bloggersHeaven.in";
const aboutContent = "Hey there, this is Saurabh Sahay, Sophomore at IIT Kanpur, from Civil Engineering Department. This website is created by me using nodejs and MongoDB to store the data. Here you can publish your blogs after signing in and read other related blogs";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();
const PORT = process.env.PORT || 3000;
app.set('view engine', 'ejs');


app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://admin-saurabh:test123@cluster0.jvn2q.mongodb.net/blogDB');

const store=new mongoDBsession({
  uri:'mongodb+srv://admin-saurabh:test123@cluster0.jvn2q.mongodb.net/blogDB',
  collection:'mySessions',
})

app.use(session({
  secret:"this is a secret",
  resave:false,
  saveUninitialized:false,
  store:store,
}))


const postSchema={
  title:String,
  content:String
};

const Post=mongoose.model("Post",postSchema);

const isAuth=(req,res,next)=>{
  if(req.session.isAuth){
    next()
  }
  else{
    res.redirect('/login')
  }
}


app.get('/',function(req,res){
  Post.find({},function(err,posts){
    res.render('home',{
      homeStartingContent:homeStartingContent,
      posts:posts
    });
  });
});


app.get('/about',function(req,res){
  res.render('about',{about:aboutContent});
});


app.get('/contact',function(req,res){
  res.render('contact',{contact:contactContent});
});

app.get('/publish',isAuth,function(req,res){
  res.render('compose');
});

app.get('/profile',isAuth,(req,res)=>{
  res.render('profile')
})

app.get('/login',(req,res)=>{
  res.render('login')
})

app.post('/login',async (req,res)=>{
  const {email,password}=req.body;
  const user=await userModel.findOne({email});
  if(!user){
    return res.redirect('/login')
  }
  const isMatch=bcrypt.compareSync(password,user.password);
  
  
  if(!isMatch){
    return res.redirect('/login');
  }
  req.session.isAuth=true;
  res.redirect('/publish');
})


app.get('/register',(req,res)=>{
  res.render('register')
})

app.post('/register',(req,res)=>{
  const username=req.body.name;
  const email=req.body.email;
  const password=req.body.password;
  // console.log(username,email,password)
  let U=userModel.findOne({email});
  if(!U){
    return res.redirect('/register')
  }
  var salt = bcrypt.genSaltSync(10);
  const hashedpsw=  bcrypt.hashSync(password,salt)
  let user=new userModel({
    username,
    email,
    password:hashedpsw,
  })

  user.save();
  // console.log(username,email,password)
  res.redirect('/login');

})

app.post('/publish',function(req,res){
//  var post={
//    title: req.body.postTitle,
//    text: req.body.postText
//  }
 const post=new Post({
   title:req.body.postTitle,
   content: req.body.postText
 });

 post.save(function(err){
   if(!err){
     res.redirect('/');
   }
 });
});


app.get("/posts/:postId",function(req,res){
 
  const requestedPostId=req.params.postId;
  Post.findOne({_id: requestedPostId}, function(err, post){

    res.render("post", {
 
      title: post.title,
 
      content: post.content
 
    });
 
  });
});




app.listen(PORT, function() {
  console.log("Server started on port 3000");
});
