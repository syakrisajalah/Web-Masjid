/**
 * GOOGLE APPS SCRIPT CODE
 * =======================
 * Copy kode ini ke editor Google Apps Script (Extensions > Apps Script) pada Google Sheet Anda.
 * 
 * STRUKTUR SHEET (Tab) YANG WAJIB DIBUAT:
 * 1. Sheet 'users': id, email, password, name, role, isUstadz (TRUE/FALSE)
 * 2. Sheet 'posts': id, title, category, excerpt, content, date, author, imageUrl
 * 3. Sheet 'finance': id, date, description, amount, type, category
 * 4. Sheet 'prayer_times': name, time
 * 5. Sheet 'gallery': id, type, url, title
 * 6. Sheet 'programs': title, description, icon (emoji/text)
 * 7. Sheet 'profile': section, content 
 * 8. Sheet 'staff': name, role, imageUrl
 * 9. Sheet 'bank_accounts': bankName, accountNumber, holderName
 * 10. Sheet 'consultations': id, userId, userName, question, answer, answeredBy, status, createdAt, answeredAt
 * 
 * CARA DEPLOY (Update):
 * 1. Klik tombol "Deploy" > "Manage deployments"
 * 2. Klik icon pensil (Edit) pada versi yang aktif
 * 3. Version: "New version"
 * 4. Klik "Deploy"
 */

function doGet(e) {
  const action = e.parameter.action;
  const db = SpreadsheetApp.getActiveSpreadsheet();
  
  let result = {};
  
  try {
    if (action === 'getPosts') {
      result = getData(db, 'posts');
    } else if (action === 'getFinance') {
      result = getData(db, 'finance');
    } else if (action === 'getPrayerTimes') {
      result = getData(db, 'prayer_times');
    } else if (action === 'getGallery') {
      result = getData(db, 'gallery');
    } else if (action === 'getPrograms') {
      result = getData(db, 'programs');
    } else if (action === 'getProfile') {
      result = {
        details: getData(db, 'profile'),
        staff: getData(db, 'staff')
      };
    } else if (action === 'getBankAccounts') {
      result = getData(db, 'bank_accounts');
    } else if (action === 'getConsultations') {
       result = getData(db, 'consultations');
    } else if (action === 'getPostById') {
        const id = e.parameter.id;
        const posts = getData(db, 'posts');
        const post = posts.find(p => p.id == id);
        result = post ? post : { error: 'Post not found' };
    } else {
      result = { error: 'Action not found' };
    }
  } catch (err) {
    result = { error: err.toString() };
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const db = SpreadsheetApp.getActiveSpreadsheet();
  const params = JSON.parse(e.postData.contents);
  const action = params.action;
  
  let result = {};
  
  try {
    if (action === 'login') {
      const users = getData(db, 'users');
      const user = users.find(u => u.email === params.email && u.password === params.password);
      if (user) {
        result = { 
          success: true, 
          user: { 
            id: user.id, 
            name: user.name, 
            role: user.role, 
            email: user.email,
            isUstadz: user.isUstadz === true || user.isUstadz === "TRUE"
          } 
        };
      } else {
        result = { success: false, message: 'Email atau password salah' };
      }
    } else if (action === 'submitConsultation') {
        const sheet = db.getSheetByName('consultations');
        const id = new Date().getTime().toString();
        const now = new Date().toISOString();
        // id, userId, userName, question, answer, answeredBy, status, createdAt, answeredAt
        sheet.appendRow([id, params.userId, params.userName, params.question, '', '', 'pending', now, '']);
        result = { success: true, message: 'Pertanyaan berhasil dikirim' };
    } else if (action === 'answerConsultation') {
        const sheet = db.getSheetByName('consultations');
        const data = sheet.getDataRange().getValues();
        let rowIndex = -1;
        
        // Find row by ID (Column 0)
        for(let i = 1; i < data.length; i++) {
            if(data[i][0] == params.id) {
                rowIndex = i + 1; // 1-based index
                break;
            }
        }
        
        if (rowIndex > -1) {
            const now = new Date().toISOString();
            // Update Answer (Col 5), AnsweredBy (Col 6), Status (Col 7), AnsweredAt (Col 9)
            sheet.getRange(rowIndex, 5).setValue(params.answer);
            sheet.getRange(rowIndex, 6).setValue(params.answeredBy);
            sheet.getRange(rowIndex, 7).setValue('answered');
            sheet.getRange(rowIndex, 9).setValue(now);
            result = { success: true };
        } else {
            result = { success: false, message: 'Data tidak ditemukan' };
        }
    }
    
  } catch (err) {
    result = { error: err.toString() };
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function getData(db, sheetName) {
  const sheet = db.getSheetByName(sheetName);
  if (!sheet) return [];
  
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const data = [];
  
  for (let i = 1; i < rows.length; i++) {
    let row = rows[i];
    let obj = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j];
    }
    data.push(obj);
  }
  return data;
}
