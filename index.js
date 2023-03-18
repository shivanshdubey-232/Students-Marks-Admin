const express =  require('express');
const app = express();
const path = require('path');
const methodOverride = require("method-override")
const Student = require('./models/student')
const Subject = require('./models/subject')
const Score = require('./models/score')
const mongoose = require("mongoose");
mongoose.set('strictQuery', true);
mongoose.connect('mongodb://127.0.0.1:27017/school ', {
    useNewUrlParser: true,
    useUnifiedTopology: true})
    .then(() =>{
        console.log("Connection open !");
    })
    .catch((err) => {
        console.log("Oh No! Error :(");
        console.log(err); 
    } )
    
app.use(express.urlencoded({extended : true}));
app.use(methodOverride('_method'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//---------------------------------------main students route---------------------------------------------
app.get('/', async(req, res) => {
  res.redirect('/students'); //redirecting to '/students' route 
})

app.get('/students', async (req, res) => {
  const students = await Student.find();
  let result = {}
  for(student of students){
    const studentKey = student.id;
    // console.log(student.id);
    const scores = await Score.find({student:student.id});
    // console.log(scores);
    let totScore = 0;
    let len = scores.length;
    for(score of scores){
      totScore += score.score;
    }
    // console.log(totScore);
    if (len == 0){
      result[studentKey] = ["-", "-"]
    }else{
      result[studentKey] = [totScore, (totScore/len).toFixed(2)]
    }
  }
  res.render("students/index.ejs", { students, result});
})

//-------------------------------------show collapsed data of student route-----------------------------
app.get("/students/:id", async (req, res) => {
  const {id} = req.params;
  const student = await Student.findById(id);
  res.render("students/show", { student});
})

// -------------------------------------------Edit student routes -------------------------------------
app.get("/students/:id/edit", async (req, res) => {
  const {id} = req.params;
  const student = await Student.findById(id);
  res.render("students/edit", { student});
})
app.put("/students/:id", async (req, res) => {
  const {id} = req.params;
  const student = await Student.findByIdAndUpdate(id, req.body, {runValidators: true, new : true});
  res.redirect(`/students/${id}`)
})

//------------------------------------------new student route---------------------------------------------
app.get("/student/new", (req, res) => {
  res.render("students/new.ejs");
})
app.post("/students", async (req, res) => { 
  const newStudent = new Student(req.body);
  await newStudent.save();
  res.redirect("/students");
})

// --------------------------------------------Delete student Route-----------------------------------
app.delete("/students/:id", async(req, res) =>{
  const {id} = req.params;
  const deletedStudent = await Student.findByIdAndDelete(id);
  res.redirect("/students");    
})


//---------------------------------------main subject route-------------------------------------------
app.get('/subjects', async(req, res) => {
  const subjects = await Subject.find({});
  res.render("subjects/index.ejs", {subjects});
})
//----------------------------------------new subject route-------------------------------------------
app.get("/subjects/new", (req, res) => {
  res.render("subjects/new.ejs");
})
app.post("/subjects", async (req, res) => { 
  console.log(req.body)
  const newSubject = new Subject(req.body);
  await newSubject.save();
  res.redirect("/subjects");
})

// --------------------------------------------Delete subject Route-----------------------------------
app.delete("/subjects/:id", async(req, res) =>{
  const {id} = req.params;
  await Subject.findByIdAndDelete(id);
  await Score.deleteMany({subject:id})
  res.redirect("/subjects");    
})

// -------------------------------show scores route--------------------------------------------------
app.get('/scores/:id', async(req, res) => {
  const {id} = req.params;
  const student = await Student.findById(id)
  const scoreRow = await Score.find({student:id});
  const subScore = {};
  let marksScored = 0, cnt = 0;
  for(let score of scoreRow){
    const subject = await Subject.findById(score.subject);
    const subName = subject.name;
    subScore[subName] = score.score;
    marksScored += score.score;
    cnt ++;
  }
  const percentage = (marksScored / cnt).toFixed(2);
  const totalMarks = cnt * 100;
  res.render(`scores/index.ejs`,{student, subScore, marksScored, percentage, totalMarks});
})

// -----------------------------edit scores route----------------------------------------------------
app.get("/scores/:id/edit", async (req, res) => {
  const {id} = req.params;
  const student = await Student.findById(id);
  const subjects = await Subject.find();
  res.render("scores/edit", { student ,subjects});
})
app.put("/scores/:id", async (req, res) => {
  const {id} = req.params; 
  await Score.deleteMany({student: id})
  const subIDScore = req.body;
  for(let subjectID in subIDScore){
    const newScore = {}
    newScore.student = id;
    newScore.subject = subjectID;
    newScore.score = subIDScore[subjectID];
    const newData = new Score(newScore)
    await newData.save();
  }
  res.redirect(`/scores/${id}`);
})


// listening to port ..........................................................................
app.listen(8080, () =>{
  console.log("App is listening on port 8080!");
})
// --------------------------------------------------------------------------------------------
