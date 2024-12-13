const userModel = require("../model/userModel")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const genToken = (id,name,addresses)=>{
    return jwt.sign({id,name,addresses},process.env.JWT_SECRET)
}

const signUp =async (req,res) =>{
let {name,email,password} = req.body

try{

let user = await userModel.findOne({email})
if(user){
   return res.status(409).json({message:"User Already Exist",success:false})
}

else{
bcrypt.genSalt(10,function(err,salt){
    bcrypt.hash(password,salt,async function(err,hash){
        user = await userModel.create({name:name,email:email,password:hash})
        res.status(201).json({message:"User create successfully",success:true,token:genToken(user._id,user.name,user.addresses),user:{name:user.name}})
    })
})
}

}catch(err){
   res.status(500).json({message:"Internal Server Error",success:false})
}

}

const login =async (req,res) =>{

    let {email,password} = req.body

    try{
    
    let user = await userModel.findOne({email})
    if(!user){
       return res.status(403).json({message:"User not exit",success:false})
    }
    
    else{
  await bcrypt.compare(password,user.password,(err,result)=>{
    if(result){
        res.status(201).json({message:"Login successfully",success:true,token:genToken(user._id,user.name,user.addresses),user:{name:user.name,isEmailVerf:user.isEmailVerified,id:user._id}})
    }
    else{
     res.status(403).json({message:"Email or password is wrong",success:false})
    }
   })
    }
    
    }
    catch(err){
       res.status(500).json({message:"Internal Server Error",success:false})
    }
}

const logout = (req,res) =>{
    res.clearCookie("token")
    res.status(201).json({message:"Logout Successfully",succes:true})
}

const googleLogin = async (req, res) => {
    const { name, email, photo } = req.body;

    try {
        // Check if the user already exists
        let user = await userModel.findOne({ email });

        if (!user) {
            // Create a new user without a password
            user = new userModel({
                name,
                email,
                photo,
                isEmailVerified:true,
                // Do not set password here
            });
            await user.save();
        }

        // Generate a token and respond
        const token = genToken(user._id,user.name,user.addresses);// Implement token generation logic
        let id = user._id
        res.status(200).json({ success: true, token, user:{name,email,id} });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const upDateEmailVerf =async (req,res) =>{
const {id} = req.body
const user = await userModel.findByIdAndUpdate(

    id,

    { $set: { isEmailVerified: true } }, // Toggle the isActive value

    { new: true } // Return the updated document

);
res.json(user);
}


module.exports = {signUp,login,logout,googleLogin,upDateEmailVerf}