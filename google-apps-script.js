// Google Apps Script for Google Forms integration
// Add this script to your Google Sheet (Extensions > Apps Script)

function onFormSubmit(e) {
  const sheet = e.range.getSheet();
  const row = e.range.getRow();
  
  // Get the form data
  const formData = e.values;
  
  // Add default status and admin notes columns if they don't exist
  const lastColumn = sheet.getLastColumn();
  
  // If we don't have enough columns, add them
  if (lastColumn < 10) {
    // Add Status column (I)
    if (lastColumn < 9) {
      sheet.getRange(1, 9).setValue('Status');
    }
    // Add Admin Notes column (J)
    if (lastColumn < 10) {
      sheet.getRange(1, 10).setValue('Admin Notes');
    }
  }
  
  // Set default status to Pending
  sheet.getRange(row, 9).setValue('Pending');
  sheet.getRange(row, 10).setValue('');
  
  // Optional: Send notification email to admin
  try {
    const adminEmail = 'your-admin-email@example.com'; // Change this to your email
    const customerName = formData[1] || 'Unknown';
    const service = formData[4] || 'Unknown Service';
    const date = formData[5] || 'Not specified';
    const time = formData[6] || 'Not specified';
    
    const subject = `New Booking Request - ${customerName}`;
    const body = `
New booking request received:

Customer: ${customerName}
Email: ${formData[2] || 'Not provided'}
Phone: ${formData[3] || 'Not provided'}
Service: ${service}
Date: ${date}
Time: ${time}
Notes: ${formData[7] || 'None'}

Please review in the admin dashboard.
    `;
    
    MailApp.sendEmail({
      to: adminEmail,
      subject: subject,
      body: body
    });
  } catch (error) {
    console.log('Email notification failed:', error);
  }
  
  // Optional: Add to Google Calendar
  try {
    addToCalendar(formData);
  } catch (error) {
    console.log('Calendar integration failed:', error);
  }
}

function addToCalendar(formData) {
  const calendar = CalendarApp.getDefaultCalendar();
  const customerName = formData[1] || 'Unknown';
  const service = formData[4] || 'Unknown Service';
  const date = formData[5];
  const time = formData[6];
  const notes = formData[7] || '';
  
  if (date && time) {
    try {
      // Parse the date and time
      const appointmentDate = new Date(date);
      const [hours, minutes] = time.split(':');
      appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      // Create calendar event
      const event = calendar.createEvent(
        `${service} - ${customerName}`,
        appointmentDate,
        new Date(appointmentDate.getTime() + 60 * 60 * 1000), // 1 hour duration
        {
          description: `Customer: ${customerName}\nService: ${service}\nNotes: ${notes}\nStatus: Pending Approval`,
          location: 'Your Business Address' // Change this
        }
      );
      
      // Set event color to orange (pending)
      event.setColor(CalendarApp.EventColor.ORANGE);
      
    } catch (error) {
      console.log('Failed to create calendar event:', error);
    }
  }
}

// Function to manually sync existing data
function syncExistingData() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();
  
  // Add headers if they don't exist
  if (sheet.getRange(1, 9).getValue() !== 'Status') {
    sheet.getRange(1, 9).setValue('Status');
  }
  if (sheet.getRange(1, 10).getValue() !== 'Admin Notes') {
    sheet.getRange(1, 10).setValue('Admin Notes');
  }
  
  // Set all existing rows to Pending status if they don't have a status
  for (let i = 2; i <= lastRow; i++) {
    const status = sheet.getRange(i, 9).getValue();
    if (!status) {
      sheet.getRange(i, 9).setValue('Pending');
    }
  }
  
  console.log('Data sync completed');
}

// Function to test the setup
function testSetup() {
  console.log('Testing admin dashboard setup...');
  
  const sheet = SpreadsheetApp.getActiveSheet();
  const headers = sheet.getRange(1, 1, 1, 10).getValues()[0];
  
  console.log('Current headers:', headers);
  
  const requiredHeaders = ['Timestamp', 'Name', 'Email', 'Phone', 'Service', 'Date', 'Time', 'Notes', 'Status', 'Admin Notes'];
  
  let allGood = true;
  requiredHeaders.forEach((header, index) => {
    if (headers[index] !== header) {
      console.log(`Missing or incorrect header at column ${index + 1}: Expected "${header}", got "${headers[index]}"`);
      allGood = false;
    }
  });
  
  if (allGood) {
    console.log('✅ Setup looks good! Your admin dashboard should work correctly.');
  } else {
    console.log('❌ Please fix the header issues above.');
  }
}
