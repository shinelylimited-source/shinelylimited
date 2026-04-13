/**
 * Google Apps Script to handle form submissions from SHINELY LIMITED website.
 * 
 * Instructions:
 * 1. Go to https://script.google.com/
 * 2. Create a new project.
 * 3. Paste this code into the editor.
 * 4. Replace 'info@shinelylimited.com' with your actual email address.
 * 5. Click "Deploy" > "New deployment".
 * 6. Select "Web app".
 * 7. Set "Execute as" to "Me".
 * 8. Set "Who has access" to "Anyone".
 * 9. Copy the Web App URL and paste it into the index.html script.
 */

function doPost(e) {
  try {
    // Parse the incoming data
    var data = JSON.parse(e.postData.contents);
    
    var name = data.name;
    var email = data.email;
    var phone = data.phone || 'Not provided';
    var message = data.message;
    
    // Email configuration
    var recipient = 'info@shinelylimited.com'; // CHANGE THIS TO YOUR EMAIL
    var subject = 'New Contact Form Submission: ' + name;
    
    var body = 'You have a new message from your website contact form:\n\n' +
               'Name: ' + name + '\n' +
               'Email: ' + email + '\n' +
               'Phone: ' + phone + '\n\n' +
               'Message:\n' + message;
    
    // Send the email
    MailApp.sendEmail({
      to: recipient,
      subject: subject,
      replyTo: email,
      body: body
    });
    
    // Return success response
    return ContentService.createTextOutput(JSON.stringify({ 'result': 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Return error response
    return ContentService.createTextOutput(JSON.stringify({ 'result': 'error', 'error': error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
