import express from 'express';
const app = express();
app.get('/', (req, res)=>{
    res.send("hii")
})
app.listen(2000);