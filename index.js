const express=require("express");
const path=require("path");
const axios = require("axios");
const crypto = require('crypto');
const base64 = require('base64topdf');
var data;

const app=express();
app.use(express.urlencoded({extended:true}));

app.use(express.static(path.join(__dirname, 'static')));
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));


app.get('/index',(req,res)=>{
    res.render('template');
});

app.post('/mobile',(req,res)=>{
    const {mobile} = req.body;
    axios({
        method: 'post',
        url: 'https://cdn-api.co-vin.in/api/v2/auth/public/generateOTP',
        data:{
            mobile:mobile
        }
    })
    .then(function (response) {
        console.log(response);
        data=response.data;
    }).catch(err=>{
        console.log(err);
    });
    res.render('OTP');
});
app.post('/otp',(req,res)=>{
    const {otp} = req.body;
    data.otp=crypto.createHash('sha256').update(otp).digest('hex');
    console.log(data);
    axios({
        method: 'post',
        url: 'https://cdn-api.co-vin.in/api/v2/auth/public/confirmOTP',
        data:data
    })
    .then(function (response) {
        console.log(response);
        data = response.data;
    }).catch((err)=>{
        console.log(err);
    })
    res.render('beneficiary');
});
app.post('/id',(req,res)=>{
    const {id} = req.body;
    const tok=data.token;
    axios({
        method: 'get',
        url: `https://cdn-api.co-vin.in/api/v2/registration/certificate/public/download?beneficiary_reference_id=${id}`,
        headers:{
            'Authorization':`Bearer ${tok}`,
            'Accept': 'application/octet-stream'
        }
    })
    .then(function (response) {
        if(response.status==200)res.status(200).json("Good You are vaccinated!!")
    })
    .catch(err=>{
        console.log(err);
    })
})

app.listen(7000,(err,res)=>{
    if(err)return;
    console.log("App on 7000");
});