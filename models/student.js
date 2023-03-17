const mongoose = require("mongoose");
const Schema = mongoose.Schema; 

const studentSchema = new Schema({
    name: {
      type: String,
      required: true
    },
    batch: {
      type: String,
      required: true
    },
    registerationNumber: {
      type: String,
      required: true
    },
    semester:{
      type: Number
    }
});
const Student = mongoose.model("Student", studentSchema);
module.exports = Student;