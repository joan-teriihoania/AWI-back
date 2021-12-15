const db = require('./db')
const googleutils = require('./googleutils')
const DiscordOauth2 = require("discord-oauth2");
const oauth = new DiscordOauth2();
const fs = require('fs')
const ejs = require('ejs');

var nodemailer = require('nodemailer');
const logger = require('./logger');
var transporter = nodemailer.createTransport({
    host: "smtp.umontpellier.fr",
    port: 465,
    secure: true, // use TLS
    auth: {
        user: process.env.MAIL_EMAIL,
        pass: process.env.MAIL_PASSWORD
    },
    tls: {
      // do not fail on invalid certs
      rejectUnauthorized: false,
    },
});

transporter.verify(function (error, success) {
    if (error) {
      logger.log(error);
    } else {
      logger.log("[MAIL] Server is ready to take our messages");
    }
});

// var transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: process.env.MAIL_EMAIL,
//         pass: process.env.MAIL_PASSWORD
//     },
//     tls: {
//         rejectUnauthorized: false
//     }
// });


function endsWithAny(suffixes, string) {
    return suffixes.some(function (suffix) {
        return string.endsWith(suffix);
    });
}

function validateEmail(email) {
    if(!email || email == "") return false
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase()) && endsWithAny(process.env.AUTHORIZED_EMAIL_END_WITH.split(','), email);
}

module.exports = {
    sendMail: function(to, subject, content){
        return new Promise((resolve, reject) => {
            if(!validateEmail(to)) return reject("Mail invalide : " + to)
            let template = ""

            if (
                typeof content === 'object' &&
                !Array.isArray(content) &&
                content !== null
            ) {
                // content is an object
                template = fs.readFileSync("./modules/mail_template.html", "utf-8")
                template = ejs.render(template, {
                    content: content,
                    baseUrl: process.env.BASE_URL
                })
            } else {
                template = content
            }

            template = template.replace(/{{ BASE_URL }}/gi, process.env.BASE_URL)
            
            var mailOptions = {
                from: process.env.MAIL_EMAIL+' <Polygenda>',
                to: to,
                subject: subject,
                html: template
            };
            
            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    logger.log("[MAIl] Email error: " + error)
                    reject(error)
                } else {
                    logger.log("[MAIL] Email sent to "+to+": " + info)
                    resolve(info)
                }
            });
        })
    }
}


// module.exports.sendMail("joprocorp@gmail.com", "test", {
//     header: {
//         title: "Test",
//         subtitle: "petit test"
//     },
//     main: {
//         components: [
//             {
//                 type: "text",
//                 content: [
//                     {
//                         type: "title",
//                         lines: [
//                             "Bonjour,"
//                         ]
//                     },
//                     {
//                         type: "text",
//                         lines: [
//                             "ça va ?",
//                             "moi ça va"
//                         ]
//                     }
//                 ]
//             },
//             {
//                 type: "button",
//                 text: "Cheh"
//             }
//         ]
//     }
// })
