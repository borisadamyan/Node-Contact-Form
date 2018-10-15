 const express = require('express');
 const bodyParser  = require('body-parser');
 const exphbs = require('express-handlebars');
 const  path = require('path');
 const  nodemailer = require('nodemailer');
 const app = express();
 var multer  = require('multer');
 var upload = multer({ dest: 'public/img' });
  const multConf = {
    storage: multer.diskStorage({
      destination: function (req, file, next) {
        next(null, 'public/img')
      },
      filename: function (req, file, next) {
        console.log(file);
        const  ext = file.mimetype.split('/')[1];
        next(null, file.filename + '-' + Date.now() + '.' + ext);
      }
    }),
    fileFilter: function (req, file, next) {
      if(!file){
        next();
      }
      const  image = file.mimetype.startsWith('image/');
      if(image){
        next(null, true)
      }else{
        next({message: "File type not supported"}, false)
      }
    }
  };
 app.engine('handlebars', exphbs());
 app.set('view engine', 'handlebars');

 //Static Folder

 app.use('/public', express.static(path.join(__dirname, 'public')));

 // Body parser

 app.use(bodyParser.urlencoded({extended: false}));
 app.use(bodyParser.json());

 app.get('/', (req, res) => {
   res.render('contact')
 });

 app.post('/send', multer(multConf).single('photo'), (req, res) => {

   if(req.file){
     req.body.photo = req.file.filename;
   }
   console.log(req.body.photo);
   const output = `
      <p>You have a new contact request</p>
      <h3>Contact Details</h3>
      <ul>
        <li>Name: ${req.body.name}</li>
        <li>Company: ${req.body.company}</li>
        <li>Email: ${req.body.email}</li>
        <li>Phone: ${req.body.phone} </li>
      </ul>
      <h3>Message</h3>
      <p>${req.body.message}</p>`;
   // create reusable transporter object using the default SMTP transport

   let transporter = nodemailer.createTransport({
     host: 'smtp.gmail.com',
     port: 587,
     secure: false, // true for 465, false for other ports
     auth: {
       user: 'spy.armenia@gmail.com', // generated ethereal user
       pass:  '********'// generated ethereal password
     },
     tls:{
       rejectUnauthorized: false
     }
   });

   // setup email data with unicode symbols
   let mailOptions = {
     from: '"NodeMailer" no-replay@gmail.com', // sender address
     to: 'borammos@gmail.com', // list of receivers
     subject: 'Hello ✔ Node contact', // Subject line
     text: 'Hello world?', // plain text body
     html: output, // html body
     attachments: [
       {
         path: __dirname +'/public/img/'+ req.body.photo
       }
     ]
   };

   // send mail with defined transport object
   transporter.sendMail(mailOptions, (error, info) => {
     if (error) {
       return console.log(error);
     }
     console.log('Message sent: %s', info.messageId);
     console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
     res.render('contact', {msg: 'Email has been send'})
   });
   });
 app.listen(3000, () => console.log('Server START...'));
