/**
 * Google Apps Script for Employee Attendance App
 * 
 * Instructions:
 * 1. Open your Google Sheet.
 * 2. Click "Extensions" > "Apps Script".
 * 3. Delete any existing code and paste this script.
 * 4. Click the Save icon (floppy disk).
 * 5. Click "Deploy" > "New Deployment".
 * 6. Select "Web app" (click the gear icon next to "Select type").
 * 7. Set "Execute as" to "Me".
 * 8. Set "Who has access" to "Anyone".
 * 9. Click "Deploy" and authorize access if requested.
 * 10. Copy the "Web app URL" and paste it in the settings panel of the app.
 */

function doPost(e) {
  // CORS setup
  var headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("ไม่มีข้อมูลส่งเข้ามา");
    }

    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    
    // Parse the date (or use current server time as fallback)
    var dateVal = data.timestamp ? new Date(data.timestamp) : new Date();
    
    // Format Month and Year in Thai (e.g. "มิถุนายน 2569")
    var monthNames = [
      "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", 
      "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    ];
    var thaiMonth = monthNames[dateVal.getMonth()];
    var yearThai = dateVal.getFullYear() + 543; // Buddhist Era (พ.ศ.)
    var sheetName = thaiMonth + " " + yearThai;
    
    // Check if worksheet exists, if not, create it
    var ws = sheet.getSheetByName(sheetName);
    if (!ws) {
      ws = sheet.insertSheet(sheetName);
      
      // Create headers
      ws.appendRow([
        "วันที่",
        "เวลา",
        "ชื่อพนักงาน",
        "ประเภท",
        "พิกัด Latitude",
        "พิกัด Longitude",
        "แผนที่ (Google Maps)",
        "หมายเหตุ / บันทึกเพิ่มเติม"
      ]);
      
      // Format headers
      var headerRange = ws.getRange("A1:H1");
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#0f172a"); // Dark Slate 900
      headerRange.setFontColor("#ffffff");
      headerRange.setHorizontalAlignment("center");
      headerRange.setFontSize(11);
      
      // Freeze header row
      ws.setFrozenRows(1);
    }
    
    var mapLink = "https://www.google.com/maps?q=" + data.latitude + "," + data.longitude;
    
    // Append the row of data
    ws.appendRow([
      data.formattedDate,             // Col A: Date
      data.formattedTime,             // Col B: Time
      data.employeeName,              // Col C: Employee Name
      data.type === "check_in" ? "เข้างาน" : "ออกงาน", // Col D: Type
      data.latitude,                  // Col E: Lat
      data.longitude,                 // Col F: Long
      "",                             // Col G: Map Link (Will set Formula below)
      data.notes || ""                // Col H: Notes
    ]);
    
    var lastRow = ws.getLastRow();
    
    // Set formula for Google Maps link in Column G
    var mapCell = ws.getRange(lastRow, 7);
    mapCell.setFormula('=HYPERLINK("' + mapLink + '", "ดูแผนที่ตำแหน่ง")');
    mapCell.setFontColor("#0284c7"); // Light blue link
    mapCell.setFontUnderline(true);
    mapCell.setHorizontalAlignment("center");
    
    // Apply center alignment to layout elements
    ws.getRange(lastRow, 1, 1, 2).setHorizontalAlignment("center"); // Date, Time
    ws.getRange(lastRow, 4, 1, 3).setHorizontalAlignment("center"); // Type, Lat, Lng
    
    // Auto fit column widths
    ws.autoResizeColumns(1, 8);
    
    var response = {
      status: "success",
      message: "บันทึกเวลาปฏิบัติงานเรียบร้อยแล้ว (" + sheetName + ")",
      sheetName: sheetName
    };
    
    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    var errResponse = {
      status: "error",
      message: "เกิดข้อผิดพลาดในการบันทึก: " + error.toString()
    };
    
    return ContentService.createTextOutput(JSON.stringify(errResponse))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  var response = {
    status: "success",
    message: "การเชื่อมต่อ Google Sheets ทำงานได้ปกติ (GET Response)",
    info: "กรุณาใช้แอปพลิเคชันผ่านเว็บเบราว์เซอร์ในการลงบันทึกเวลาทำงาน"
  };
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT);
}
