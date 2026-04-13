/**
 * SHINELY LIMITED - Quote Request Handler
 * 
 * IMPORTANT: If you get a "getFolderById" error, you MUST:
 * 1. Run the 'setup' function manually in the script editor.
 * 2. Complete the authorization pop-up.
 * 3. Deploy as a NEW VERSION.
 */

// --- CONFIGURATION ---
const CONFIG = {
  sheetId: '1Woz4QUYZqSUBvjmrAIeGjL42Pdn8EOo6RbPnRgMphlQ', // Replace with your Google Sheet ID
  folderId: '1CvBKLD0KLbbzrdVDmObBLt2UTMwl_v8A', // Replace with your Google Drive Folder ID
  adminEmail: 'info@shinelylimited.com',
  sheetName: 'ImageAttached'
};

function doPost(e) {
  // Add this to force DriveApp authorization if not already granted
  // DriveApp.getRootFolder(); 

  try {
    const ss = SpreadsheetApp.openById(CONFIG.sheetId);
    const sheet = ss.getSheetByName(CONFIG.sheetName) || ss.insertSheet(CONFIG.sheetName);

    // Get form data
    const data = e.parameter;
    const timestamp = new Date();

    // Handle image attachment
    let imageBlob = null;
    let imageLink = 'N/A';
    let imageAttachedStatus = 'No';

    // Check if an image file was uploaded
    // e.parameter.image usually contains the blob in a multipart/form-data POST
    if (e.parameter.image) {
      imageBlob = e.parameter.image;
      
      // Ensure it's a valid Blob object
      if (imageBlob && typeof imageBlob === 'object' && typeof imageBlob.copyBlob === 'function') {
        try {
          // Explicitly get the folder
          const folder = DriveApp.getFolderById(CONFIG.folderId);
          
          // Rename the blob
          const fileName = (data.name || 'quote').replace(/[^a-z0-9]/gi, '_').toLowerCase() + '_' + timestamp.getTime() + '.jpg';
          imageBlob.setName(fileName);
          
          // Create the file in the folder
          const file = folder.createFile(imageBlob);
          file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
          imageLink = file.getUrl();
          imageAttachedStatus = 'Yes';
        } catch (driveError) {
          console.error('Drive Error:', driveError);
          imageLink = 'Error saving to Drive: ' + driveError.message;
        }
      }
    }

    // Prepare row for Google Sheet
    const rowData = [
      timestamp,
      data.name || 'N/A',
      data.email || 'N/A',
      data.phone || 'N/A',
      data.address || 'N/A',
      data.service || 'N/A',
      data.size || 'N/A',
      data.details || 'N/A',
      imageLink,
      imageAttachedStatus
    ];

    // Append data to Google Sheet
    sheet.appendRow(rowData);

    // Send confirmation email to user
    if (data.email && data.email.includes('@')) {
      const userSubject = 'SHINELY LIMITED: Quote Request Received';
      const userBody = `Dear ${data.name},\n\n` +
        `Thank you for your quote request. We have received your submission and will get back to you within 24 hours.\n\n` +
        `Summary:\n` +
        `Service: ${data.service}\n` +
        `Image Attached: ${imageAttachedStatus}\n\n` +
        `Best regards,\nSHINELY LIMITED Team`;
      MailApp.sendEmail(data.email, userSubject, userBody);
    }

    // Send notification email to admin
    const adminSubject = 'NEW QUOTE REQUEST - ' + (data.name || 'Website');
    let adminBody = `New submission details:\n\n` +
      `Timestamp: ${timestamp}\n` +
      `Name: ${data.name}\n` +
      `Email: ${data.email}\n` +
      `Phone: ${data.phone}\n` +
      `Address: ${data.address}\n` +
      `Service: ${data.service}\n` +
      `Size: ${data.size}\n` +
      `Details: ${data.details}\n` +
      `Image Link: ${imageLink}\n` +
      `Image Attached: ${imageAttachedStatus}\n\n` +
      `Sheet: https://docs.google.com/spreadsheets/d/${CONFIG.sheetId}/edit`;

    const emailOptions = {};
    if (imageAttachedStatus === 'Yes' && imageBlob) {
      emailOptions.attachments = [imageBlob];
      adminBody += '\n\nNote: The image is attached to this email.';
    }
    
    MailApp.sendEmail(CONFIG.adminEmail, adminSubject, adminBody, emailOptions);

    return ContentService.createTextOutput('Success');

  } catch (error) {
    console.error('Global Error:', error);
    return ContentService.createTextOutput('Error: ' + error.toString());
  }
}

/**
 * MANDATORY: Run this once to authorize Drive, Sheets, and Mail.
 */
function setup() {
  try {
    // Force DriveApp authorization
    const root = DriveApp.getRootFolder();
    const folder = DriveApp.getFolderById(CONFIG.folderId);
    console.log('Authorized Drive access to folder: ' + folder.getName());

    // Force SpreadsheetApp authorization
    const ss = SpreadsheetApp.openById(CONFIG.sheetId);
    const sheet = ss.getSheetByName(CONFIG.sheetName) || ss.insertSheet(CONFIG.sheetName);
    
    // Initialize Headers
    const header = [
      'Timestamp', 'Name', 'Email', 'Phone', 'Address', 
      'Service', 'Size', 'Details', 'Image Link', 'Image Attached'
    ];
    if (sheet.getLastRow() === 0) sheet.appendRow(header);
    
    console.log('Authorized Spreadsheet access.');
    console.log('Setup complete! All permissions granted.');
  } catch (e) {
    console.error('Setup Error:', e);
    throw new Error('Setup failed. Ensure your IDs are correct and you clicked "Allow": ' + e.toString());
  }
}
