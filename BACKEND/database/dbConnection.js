import mongoose from "mongoose";

export const dbConnection= ()=>{
    mongoose.connect(process.env.MONGO_URI,{
        dbName: "Dr_Sathi"
    }).then(()=>{
        console.log("DB Connected");
    }).catch(err=>{
        console.log(`some error occured while connection to the databases${err}`);
    })
}