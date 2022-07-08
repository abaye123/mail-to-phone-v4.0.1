function sendEmail() {

var tzintuks = SpreadsheetApp.getActiveSheet().getRange('trs!B7').getValue()
var url = `https://www.call2all.co.il/ym/api/`

  var directoryListing = JSON.parse(UrlFetchApp.fetch(`${url}RunTzintuk?token=${token}&phones=tzl:${tzintuks}`));
    Logger.log("הפעלת צינתוק לרשימה " + directoryListing)
  if (directoryListing.responseStatus === 'OK') {
      var sheet = SpreadsheetApp.getActiveSheet();
      var cell = sheet.getRange("sendmail!B1");
      var refresh = parseInt(cell.getValue().toString());
      var increment = refresh + 1;
        cell.setValue(increment);

      var emailaddress = SpreadsheetApp.getActiveSheet().getRange('sendmail!G1').getValue();
      var emailsubject = SpreadsheetApp.getActiveSheet().getRange('sendmail!H1').getValue();
      var emaulbody = SpreadsheetApp.getActiveSheet().getRange('sendmail!I1').getValue();
        Logger.log("כתובת המייל: " + emailaddress);
        Logger.log("הנושא: " + emailsubject);
        Logger.log("תוכן המייל: " + emaulbody);
    GmailApp.sendEmail(emailaddress, emailsubject, emaulbody);
    Logger.log('המייל נשלח בהצלחה!!' + GmailApp);

      var reset = UrlFetchApp.fetch(`${urlapi}TzintukimListManagement?action=resetList&token=${token}&TzintukimList=${tzintuks}`);
        Logger.log("איפוס רשימת הצינתוקים: " + reset);
      var menusend = UrlFetchApp.fetch(`${urlapi}UpdateExtension?token=${token}&path=ivr2:/&type=menu&say_menu_voice=yes&menu_voice=ההודעה נשלחה בהצלחה!!`);
        Logger.log("אישור שליחת המייל: " + menusend);
  }
}
