var express = require('express');
var router = express.Router();
const userModel=require("./users");
const passport = require('passport');
const localStrategy=require('passport-local');
var multer=require("multer");
var Path=require("node:path");


/* GET home page. */  
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads/')
  },
  filename: function (req, file, cb) {
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    var date= new Date();
    const fileName=Math.floor(Math.random()*1000+date.getTime()) + Path.extname(file.originalname);
    cb(null, fileName)
  }
})

const upload = multer({ storage: storage,fileFilter : fileFilter})
router.post('/upload',isloggedIn,upload.single("avtar") ,function(req,res){
  userModel.findOne({username:req.session.passport.user}).then(function(user){
    user.image=req.file.filename;
    user.save().then(function(){
      res.redirect("back");
    })
  })

})

function fileFilter (req, file, cb) {
  
  if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/svg' || file.mimetype === 'image/webp')
  {
    cb(null, true)
  }
  else 
  {
    cb(new Error('upload right format!! don"t walk fast'),false);
  }
}

passport.use(new localStrategy(userModel.authenticate()));

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});
router.get('/loginform', function(req, res, next) {
  res.render('loginform');
});
router.get('/like/:id',isloggedIn, function(req, res, next) {
  userModel.findOne({_id:req.params.id}).then(function(user){
   var jishemilaha= user.likes.indexOf(req.session.passport.user);
   if(jishemilaha===-1){
    user.likes.push(req.session.passport.user);
   }
   else
   user.likes.splice(jishemilaha,1);
   user.save().then(function(){
    res.redirect('back');
   })
  })
});
router.get('/username/:user', function(req, res, next) {
 userModel.findOne({username:req.params.user}).then(function(user){
  if(user){
    res.json({found:true});
  }
  else
  res.json({found:false});
 })
});
router.get('/profile',isloggedIn,function(req,res){
  userModel.findOne({username:req.session.passport.user}).then(function(user){
    res.render("profile",{user});
  })

  
})

router.post('/register', function(req, res, next) {
 var users= new userModel({
    username:req.body.username,
    email:req.body.email,
    number:req.body.number,
    password:req.body.password
  })
  userModel.register(users,req.body.password).then(function(u){
    passport.authenticate('local')(req,res,function(){
      res.redirect('/profile');
    })
  })
});
router.post('/login',passport.authenticate('local',
{
  successRedirect:'/profile',
  failureRedirect:'/'
}),function(req, res, next) {
 
});
router.get('/logout',function(req,res,next){
  req.logOut(function(err){
    if(err){
      return next(err);
    }
    res.redirect('/');
  })
  
})
function isloggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  else{
    res.redirect('/');
  }
}
module.exports = router;
