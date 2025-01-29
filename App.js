const express=require('express');
const userRouter=require('./routes/user.routes')
const app=express();

// to link (View/.ejs) the frontend in the backend

app.set('view engine','ejs');

app.use(express.json());
app.use(express.urlencoded({extended:true}));

// Home server
app.use('/user',userRouter);

app.listen(3000,()=>{
console.log("server is running on port http://localhost:3000/");
})