const Cloud = require('@google-cloud/storage');

const express = require("express");
const multer = require("multer");
const {exec} = require("child_process");
const {promisify} = require('util')
const sleep = promisify(setTimeout)

const app = express();
app.use(express.static("images"));

app.set("view engine", "ejs");

var Storage = multer.diskStorage({
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    },
});

var upload = multer({
    storage: Storage,
}).array("file"); //Field name and max count

app.get("/", (req, res) => {
    res.render("success", {
        success: false,
        processSuccess: false,
        processImage: false,
        getResult: false,
        getResult1: false
    });
});

app.post("/upload", (req, res) => {
    upload(req, res, function (err) {
        if (err) {
            console.log(err);
            return res.end("Something went wrong");
        } else {
            const {Storage} = Cloud
            //change path of json file and project id
            const storage = new Storage({
                keyFilename: './infoarcdevteam-5e0a7109ab90.json',
                projectId: 'infoarcdevteam',
            })
            //change name of bucket
            const bucket = storage.bucket('detectron2masterfolder');
            console.log(req.files)
            for (files of req.files) {
                //change path of bucket
                bucket.upload(files.path, {
                    destination: 'KESC_LCDTraining/predict/' + files.filename,
                }, function (err, file) {
                    if (err) throw new Error(err);
                });
            }
            res.render("success", {
                processSuccess: false,
                success: true,
                processImage: true,
                getResult: false,
                getResult1: false
            })
        }
    });
});

app.get('/logout', (req, res) => {
    res.redirect('/')
})

app.get('/process', function (req, res) {
    exec('ipconfig', (error, stdout, stderr) => {
        if (error) {
            res.json({message: {error}, status: 400})
        }
        if (stderr) {
            res.json({message: {stderr}, status: 400})
        }
        res.render("success", {
            processSuccess: true,
            success: false,
            processImage: true,
            getResult: true,
            getResult1: false
        })
    });
})
app.get('/result', (req, res) => {
    const {Storage} = Cloud
    //change path of json file and project id
    const storage = new Storage({
        keyFilename: './infoarcdevteam-5e0a7109ab90.json',
        projectId: 'infoarcdevteam',
    })
    const myBucket = storage.bucket('detectron2masterfolder');
    const file = myBucket.file('KESC_Final_Output/final_results.csv');
    file.download(function (err, contents) {
    });
    file.download({
        destination: './final_results.csv'
    }, function (err) {
    });
    file.download().then(function (data) {
        const contents = data[0];
    });

    sleep(5000).then(() => {
        file.delete(function (err, apiResponse) {
        });
        file.delete().then(function (data) {
            const apiResponse = data[0];
        });
    })

    res.render("success", {
        processSuccess: true,
        success: false,
        processImage: true,
        getResult: true,
        getResult1: true
    })
})

app.listen(3000, () => {
    console.log("App is listening on Port 3000");
});
