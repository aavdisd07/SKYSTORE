const mongoose=require('mongoose');
const userSchema= new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
        lowercase:true,
        unique:true,
        minlegth:[3,'name must be at least 3 characters long']
    },
    email:{
        type:String,
        required:true,
        trim:true,
        lowercase:true,
        unique:true,
        minlength:[13,'Email should be min length of 13 characters']
    },
    password:{
        type:String,
        required:true,
        trim:true,
        minlength:[5,'password must be atleast 5 characters long']
    }
})



const user=mongoose.model('user',userSchema);
module.exports=user;