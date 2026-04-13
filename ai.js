function doGet(e) {
  var msg = e.parameter.msg;
  var key = e.parameter.key;
  
  if (!msg) {
    return ContentService.createTextOutput(JSON.stringify({"error": "No msg"}))
           .setMimeType(ContentService.MimeType.JSON);
  }

  // 1. Try Gemini
  if (key && key.length > 10) {
    try {
      var url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + key;
      var payload = {
        "contents": [{ "parts": [{ "text": msg }] }]
      };
      var options = {
        "method": "post",
        "contentType": "application/json",
        "payload": JSON.stringify(payload),
        "muteHttpExceptions": true
      };
      var response = UrlFetchApp.fetch(url, options);
      var json = JSON.parse(response.getContentText());
      if (json.candidates && json.candidates[0].content.parts[0].text) {
        return ContentService.createTextOutput(JSON.stringify({"response": json.candidates[0].content.parts[0].text}))
               .setMimeType(ContentService.MimeType.JSON);
      }
    } catch(err) {}
  }

  // 2. Fallback to PopCat
  try {
    var popUrl = "https://api.popcat.xyz/chatbot?msg=" + encodeURIComponent(msg);
    var popRes = UrlFetchApp.fetch(popUrl);
    var popJson = JSON.parse(popRes.getContentText());
    return ContentService.createTextOutput(JSON.stringify({"response": popJson.response}))
           .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({"response": "Error connecting to AI."}))
           .setMimeType(ContentService.MimeType.JSON);
  }
}
