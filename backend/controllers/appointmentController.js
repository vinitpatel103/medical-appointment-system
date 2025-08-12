const { getConnection } = require('../config/db');

// PATIENT: View doctor slots
async function getDoctorAvailability(req, res) {
  const { doctorId } = req.params;
  const conn = await getConnection();
  const result = await conn.execute(
    `SELECT * FROM DOCTOR_AVAILABILITY WHERE DOCTOR_ID = :id AND IS_BOOKED = 'NO'`,
    [doctorId],
    { outFormat: 4001 }
  );
  res.json(result.rows);
}

const { sendEmail } = require('../utils/mailer.sendgrid');

// PATIENT: Request appointment
async function requestAppointment(req, res) {
  try {
    const { doctorId, date, time } = req.body;
    const conn = await getConnection();

    // Get patient ID + name/email
    const patientResult = await conn.execute(
      `SELECT ID, NAME, EMAIL FROM USERS WHERE EMAIL = :email`,
      { email: req.user.email }
    );
    const [patientId, patientName, patientEmail] = patientResult.rows[0];

    // Get doctor email + name
    const doctorResult = await conn.execute(
      `SELECT NAME, EMAIL FROM USERS WHERE ID = :id`,
      { id: doctorId }
    );
    const [doctorName, doctorEmail] = doctorResult.rows[0];

    // Insert appointment
    await conn.execute(
      `INSERT INTO APPOINTMENTS (ID, PATIENT_ID, DOCTOR_ID, DATE_BOOKED, TIME_SLOT, STATUS)
       VALUES (APPOINTMENT_SEQ.NEXTVAL, :pat_id, :doc_id, TO_DATE(:book_date, 'YYYY-MM-DD'), :time_slot, 'Pending')`,
      {
        pat_id: patientId,
        doc_id: doctorId,
        book_date: date,
        time_slot: time
      },
      { autoCommit: true }
    );

    // 📧 Send email to doctor
    await sendEmail(
      doctorEmail,
      `New Appointment Request from ${patientName}`,
      `<p>Dear Dr. ${doctorName},</p>
       <p>You have a new appointment request.</p>
       <ul>
         <li><b>Patient:</b> ${patientName} (${patientEmail})</li>
         <li><b>Date:</b> ${date}</li>
         <li><b>Time:</b> ${time}</li>
       </ul>
       <p>Please log in to your dashboard to accept or reject the request.</p>`
    );

    res.json({ message: '✅ Appointment request sent!' });
  } catch (err) {
    console.error("❌ Appointment request failed:", err);
    res.status(500).json({ error: err.message });
  }
}


// PATIENT: View booked appointments with doctor name
async function getPatientAppointments(req, res) {
  console.log("📥 Incoming request to getPatientAppointments");
  console.log("🔑 Decoded user from token:", req.user);

  try {
    const conn = await getConnection();
    console.log("✅ Database connection established");

    // Step 1: Get patient ID from token
    console.log("📌 Looking up patient by email:", req.user.email);
    const userResult = await conn.execute(
      `SELECT ID FROM USERS WHERE EMAIL = :email`,
      { email: req.user.email },
      { outFormat: 4002 } // ✅ Return as objects
    );
    console.log("🗄 Query result for patient lookup:", userResult.rows);

    if (userResult.rows.length === 0) {
      console.warn("⚠️ No patient found for email:", req.user.email);
      return res.status(404).json({ error: "Patient not found" });
    }

    const patientId = userResult.rows[0].ID; // ✅ Now works
    console.log("🆔 Patient ID found:", patientId);

    // Step 2: Fetch appointments with doctor name
    console.log("📌 Fetching appointments for patient ID:", patientId);
    const result = await conn.execute(
      `SELECT 
         A.ID,
         A.DATE_BOOKED,
         A.TIME_SLOT,
         A.STATUS,
         D.NAME AS DOCTOR_NAME
       FROM APPOINTMENTS A
       JOIN USERS D ON A.DOCTOR_ID = D.ID
       WHERE A.PATIENT_ID = :id
       ORDER BY A.DATE_BOOKED DESC`,
      { id: patientId },
      { outFormat: 4002 } // ✅ Keep results as objects
    );
    console.log("📅 Appointment query result:", result.rows);

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching patient appointments:", err);
    res.status(500).json({ error: err.message });
  }
}



// DOCTOR: View booked appointments
async function getDoctorAppointments(req, res) {
  try {
    const conn = await getConnection();
    const result = await conn.execute(
      `SELECT 
        A.ID,
        A.DATE_BOOKED,
        A.TIME_SLOT,
        A.STATUS,
        P.NAME AS PATIENT_NAME
      FROM 
        APPOINTMENTS A
      JOIN USERS D ON A.DOCTOR_ID = D.ID
      JOIN USERS P ON A.PATIENT_ID = P.ID
      WHERE 
        D.EMAIL = :email`,
      { email: req.user.email },
      { outFormat: 4001 } // Oracle returns an array of arrays here
    );

    // Transform array-of-arrays into array-of-objects
    const appointments = result.rows.map(row => ({
      ID: row[0],
      DATE_BOOKED: row[1],
      TIME_SLOT: row[2],
      STATUS: row[3],
      PATIENT_NAME: row[4]
    }));

    console.log("✅ Normalized Appointments:", appointments); // ✅ Debug

    res.json(appointments);
  } catch (err) {
    console.error("❌ Get doctor appointments error:", err);
    res.status(500).json({ error: err.message });
  }
}



// DOCTOR: Add availability
async function addAvailability(req, res) {
  const { date, timeSlot } = req.body;
  const conn = await getConnection();
  const user = await conn.execute(
    `SELECT ID FROM USERS WHERE EMAIL = :email`,
    { email: req.user.email }, // <-- use named binding
    { outFormat: 4001 }
  );
  const id = user.rows[0].ID;
  await conn.execute(
    `INSERT INTO DOCTOR_AVAILABILITY (ID, DOCTOR_ID, DATE_AVAILABLE, TIME_SLOT)
     VALUES (AVAIL_SEQ.NEXTVAL, :id, TO_DATE(:date, 'YYYY-MM-DD'), :slot)`,
    { id, date, slot: timeSlot }, // <-- use named binding
    { autoCommit: true }
  );
  res.json({ message: 'Availability added' });
}

// DOCTOR: Accept appointment
async function acceptAppointment(req, res) {
  const { appointmentId } = req.body;
  const conn = await getConnection();

  // Update DB
  await conn.execute(
    `UPDATE APPOINTMENTS SET STATUS = 'Accepted' WHERE ID = :id`,
    { id: appointmentId },
    { autoCommit: true }
  );

  // Get patient details
  const patientResult = await conn.execute(
    `SELECT U.NAME, U.EMAIL, A.DATE_BOOKED, A.TIME_SLOT
     FROM APPOINTMENTS A
     JOIN USERS U ON A.PATIENT_ID = U.ID
     WHERE A.ID = :id`,
    { id: appointmentId }
  );
  const [patientName, patientEmail, date, time] = patientResult.rows[0];

  // 📧 Send email to patient
  await sendEmail(
    patientEmail,
    'Your Appointment Has Been Accepted',
    `<p>Dear ${patientName},</p>
     <p>Your appointment request for <b>${date}</b> at <b>${time}</b> has been <span style="color:green;"><b>Accepted</b></span>.</p>`
  );

  res.json({ message: 'Appointment accepted' });
}

// DOCTOR: Reject appointment
async function rejectAppointment(req, res) {
  const { appointmentId } = req.body;
  const conn = await getConnection();

  // Update DB
  await conn.execute(
    `UPDATE APPOINTMENTS SET STATUS = 'Rejected' WHERE ID = :id`,
    { id: appointmentId },
    { autoCommit: true }
  );

  // Get patient details
  const patientResult = await conn.execute(
    `SELECT U.NAME, U.EMAIL, A.DATE_BOOKED, A.TIME_SLOT
     FROM APPOINTMENTS A
     JOIN USERS U ON A.PATIENT_ID = U.ID
     WHERE A.ID = :id`,
    { id: appointmentId }
  );
  const [patientName, patientEmail, date, time] = patientResult.rows[0];

  // 📧 Send email to patient
  await sendEmail(
    patientEmail,
    'Your Appointment Has Been Rejected',
    `<p>Dear ${patientName},</p>
     <p>We regret to inform you that your appointment request for <b>${date}</b> at <b>${time}</b> has been <span style="color:red;"><b>Rejected</b></span>.</p>`
  );

  res.json({ message: 'Appointment rejected' });
}

module.exports = {
  getDoctorAvailability,
  requestAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  addAvailability,
  acceptAppointment,
  rejectAppointment
};
