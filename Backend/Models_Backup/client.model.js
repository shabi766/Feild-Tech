import mongoose from "mongoose";

const clientSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    description:{
        type:String, 
    },
    website:{
        type:String 
    },
    location:{
        type:String 
    },
    logo:{
        type:String // URL to company logo
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    }
},{timestamps:true})
export const Client = mongoose.model("Client", clientSchema);