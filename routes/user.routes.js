const express=require('express');
const router=express.Router();

const {body, validationResult}=require('express-validator');
// get me form ko show krenge
router.get('/register',(req,res)=>{
res.render('register');
})

router.post('/register',(req,res)=>{
    console.log(req.body);
    res.send("name+ email+password");

})

module.exports=router;