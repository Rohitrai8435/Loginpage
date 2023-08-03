const mongoose=require("mongoose");
const passportLocalMongoose=require("passport-local-mongoose");
mongoose.connect('mongodb://127.0.0.1:27017/mydata');
const userSchema=mongoose.Schema({
  username:String,
  email:String,
  password:String,
  number:Number,
  image:{
    type:String,
    default:"default.png"
  },
  likes:{
    type:Array,
    default:[]
  }
}
)
userSchema.plugin(passportLocalMongoose);
module.exports=mongoose.model("user",userSchema);