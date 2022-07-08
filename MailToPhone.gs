 let user = SpreadsheetApp.getActiveSheet().getRange('trs!B1').getValue() // מספר המערכת
 let pass = SpreadsheetApp.getActiveSheet().getRange('trs!B2').getValue() // סיסמא
 let up = ':'
 let ph1 = 'ivr2:/'
 let ph2 = SpreadsheetApp.getActiveSheet().getRange('trs!B3').getValue() //מס' השלוחה להשמעה
 let ph3 = '/'
 let path = (`${ph1}${ph2}${ph3}`) //נתיב
 let token = (`${user}${up}${pass}`)
 let tag = SpreadsheetApp.getActiveSheet().getRange('trs!B4').getValue() //מס' השלוחה להשמעה
 let tzintuk = SpreadsheetApp.getActiveSheet().getRange('trs!B5').getValue() //מס' השלוחה להשמעה
 var urlapi = `https://www.call2all.co.il/ym/api/`


function MailToPhoneM() {
    let sabbath = JSON.parse(UrlFetchApp.fetch(`${urlapi}GetIVR2Dir?token=${token}&path=${path}`));
    //sabbath.onerror = (event) =>  {Logger.log("השרת של ימות המשיח אינו זמין")}
       //Logger.log("בדיקת שבת " + sabbath)
       Logger.log("האם כעת לא שבת? " + sabbath.responseStatus)
        if (sabbath.responseStatus === 'OK') {
  let label = GmailApp.getUserLabelByName(tag)
  let messages = label.getThreads()
    if (messages.length > 0) {
      let summ = messages.length
        Logger.log("כמות ההודעות שמטופלות בריצה זו: " + messages.length);
        UrlFetchApp.fetch(`${urlapi}UpdateExtension?token=${token}&path=ivr2:/&type=menu&say_menu_voice=yes&menu_voice=היי, יש לך ${summ} הודעות חדשות.`) 
      for (let message of messages) {
      let firstmessage = message.getMessages()[message.getMessageCount()-1]
      let unread = message.isUnread()
      Logger.log("ההודעה נקראה? " + message.isUnread())
      let subject = firstmessage.getSubject()
      let sender = firstmessage.getFrom()
      let date = firstmessage.getDate() //קבלת זמן קבלת ההודעה
        Logger.log("זמן קבלת ההודעה: " + firstmessage.getDate());
      let attachments = firstmessage.getAttachments()
        Logger.log("שמות הקבצים המצורפים: " + firstmessage.getAttachments());
      let attachmentsl = attachments.length
        Logger.log("כמות הקבצים המצורפים להודעה: " + attachments.length);
      let to = firstmessage.getTo()
      let boddy = firstmessage.getPlainBody()
         boddy = boddy.replace(/\s{2,}/g, ' ')
         boddy = boddy.substring(0,2200) + ' עד כאן החדשות, כאן רשת ב' // קבלת טקסט
         boddy = boddy.replace(new RegExp(`"|>|<`, 'g',), '')
         boddy = boddy.replace(/\S*\http\S*/g, '')
         boddy = boddy.replace(/\S\@\S/g, ' שטרודל ')
         subject = subject.replace(new RegExp(`"|>|<`, 'g'), '')
         sender = sender.replace(new RegExp(`"|>|<`, 'g'), '')
         to = to.replace(new RegExp(`"|>|<`, 'g'), '')
         //let newline = "\\" + "\\n" 
      let textmB = (`להלן הודעת המייל שהתקבלה: "מאת ${sender} אל ${to} בתאריך: ${date} :הנושא ${subject} גוף ההודעה: ${boddy}"`)  
      //Logger.log("תוכן ההודעה נקי: " + textmB);
      let result = translate(textmB,unread,message,attachmentsl,label);
      }
    }
}
}

function translate(textmB,unread,message,attachmentsl,label) {
//שליחת ההודעה לתרגום אוטמטי באמצעות מסמך השיטס המקושר
//שליחת תוכן ההודעה לתא A8 בגיליון
      var cell = SpreadsheetApp.getActiveSheet().getRange('trs!A8');
      var value = SpreadsheetApp.newRichTextValue()
          .setText(textmB)
          .build();
          cell.setRichTextValue(value);
//קריאת תוכן התא A10 שמכיל את השפה של הודעת המייל
      let lnghe = SpreadsheetApp.getActiveSheet().getRange('trs!A10').getValue()
        Logger.log("שפת ההודעה: " + lnghe);
          if (lnghe =! 'he') {
            let trs11 = SpreadsheetApp.getActiveSheet().getRange('trs!A11').getValue()
                textmBT = (`הודעה זו תורגמה באופן אוטומטי!! ${trs11}`)
              Logger.log("ההודעה תורגמה");
              let result = att(textmBT,unread,message,attachmentsl,label)
          }
          else {
            Logger.log("ההודעה לא תורגמה"); 
            let textmBT = textmB
                  let result = att(textmBT,unread,message,attachmentsl,label)
          }}

       
        function att(textmBT,unread,message,attachmentsl,label) {
          //Logger.log(attachmentsl);
            if (attachmentsl > 0) {
              let textmBa = (`${attachmentsl} קבצים מצורפים בהודעה זו. ${textmBT}`)
                Logger.log("יש קבצים מצורפים"); 
                let result = sendToYemot(textmBa,unread,message,attachmentsl,label); }
            else {
              Logger.log("אין קבצים מצורפים");
              let textmBa = textmBT
              let result = sendToYemot(textmBa,unread,message,attachmentsl,label);
            }
            }

 function sendToYemot(textmBa,unread,message,attachmentsl,label) {
      let listfile = JSON.parse(UrlFetchApp.fetch(`${urlapi}GetIVR2Dir?token=${token}&path=${path}`));
       //Logger.log(listfile)
        if (listfile.responseStatus === 'OK') {
          let lastFileName = listfile.files
              .filter(file => file.fileType === 'AUDIO' || file.fileType === 'TTS')
              .map(file => file.name.split('.')[0])
              .find(fileName => !isNaN(fileName));
          let newNumber = Number(lastFileName || -1) + 1;
          let newName = newNumber.toString().padStart(3, '0');
          let filePath = `${path}${newName}.tts`;
            Logger.log("שם הקובץ המלא: " + filePath);
            Logger.log("ההודעה כפי שתישלח בעזה לימות: " + textmBa);
      let data = {
        'token': token,
        'what': filePath,
        'contents': textmBa
      };
 
      let options = {
        'method' : 'post',
       'payload' : data
      };

      let response = UrlFetchApp.fetch(`${urlapi}UploadTextFile`, options);
      Logger.log("ההודעה נקראה? " + unread);
        if (unread == true) {
          Logger.log("ההודעה נקראה2? " + unread);
          UrlFetchApp.fetch(`${urlapi}RunTzintuk?token=${token}&phones=tzl:${tzintuk}`) }
            Logger.log("תשובת השרת של ימות המשיח לשליחת ההודעה: " + response.getContentText());
          message.removeLabel(label);// מחיקת התווית מההודעה לאחר הטיפול בה
        }
      }
