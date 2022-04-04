// Простой сервер на express

// Порт сервера
const port = 8080;

const path    = require('path');
const express = require('express');
const multer  = require('multer'); 
const fs      = require('fs');

const app     = express();

var storage = multer.diskStorage({  
  destination: function (req, file, callback) {  
    callback(null, './public/uploads');  
  },  
  filename: function (req, file, callback) {  
    callback(null, path.parse(file.originalname).name + '-' + Date.now() + path.parse(file.originalname).ext);  
  }  
});  

var fields = [
  { name: 'file', maxCount: 42 }
]
var upload = multer({ storage : storage}).fields(fields);  

// Указываем каталог для статических файлов
app.use(express.static('public'));
// Для работы с JSON
app.use(express.json());

// Главная страница
app.get('/', (req, res) => {
  const index = path.join(__dirname, '/../public', 'index.html' );
  res.sendFile(index);
});

// Метод загрузки файлов с клиентской стороны
app.post('/upload_files', (req, res) => {  
    upload(req, res, function(err) {  
        
        if(err) {  
            console.log('[/upload_files] upload error: ' + err); 
            return res.status(500).send('oops something went wrong'); 
        } 

        return res.status(200).send('files uploaded'); 
    });  
});  

// Метод возврата списка файлов
app.get('/get_files', (req, res) => {  
    var filesNames = [];

    fs.readdir(path.join(__dirname, '/../public/uploads'), (err, files) => {
      
      if(err) {  
        console.log('[/upload_files] error: ' + err); 
        return res.status(500).send('oops something went wrong'); 
      } 

      files.forEach(file => {
        filesNames.push(file);
      });

      return res.status(200).json( {files: filesNames, status: 200} );
    });
})

// Метод удалния файла с сервера
app.post('/delete_file', (req, res) => {  
    filename = req.body.filename;
    filename = filename.replace(/\/+$/, '');

    fs.unlink(path.join(__dirname, '/../public/uploads/', filename), (err => {
    if (err) {
      console.log('[/delete_file] error: ' + err); 
      return res.status(500).send('oops something went wrong');
    } else {
      return res.status(200).send('file deleted');
    }
    }));
});  


// Запуск сервера
app.listen(port, () => console.log(`Server listening on localhost:${port}...`));