const jwt = require('jsonwebtoken');
const { encrypt } = require('../utils/crypto');
const { decrypt } = require('../utils/crypto');
const { findUserByEmail, createUser } = require('../models/userModel');
const { getConnection } = require('../config/db');
const oracledb = require('oracledb');

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);
    console.log('Fetched user:', user);

    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    // Assuming: [ID, NAME, EMAIL, PASSWORD, ROLE]
    const encryptedPassword = user[3];
    const role = user[4];

    if (!encryptedPassword) return res.status(500).json({ error: 'User password not found in database', user });

    let decryptedStored;
    try {
      decryptedStored = decrypt(encryptedPassword);
    } catch (err) {
      return res.status(500).json({ error: 'Password decryption failed' });
    }

    if (decryptedStored !== password) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    const token = jwt.sign({ email, role }, process.env.JWT_SECRET);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function register(req, res) {
  const { name, email, password, role } = req.body;
  const encrypted = encrypt(password);
  await createUser(name, email, encrypted, role);
  res.status(201).json({ message: 'User registered' });
}
async function getDoctors(req, res) {
  const conn = await getConnection();
  const result = await conn.execute(
    `SELECT ID, NAME, EMAIL FROM USERS WHERE ROLE = 'DOCTOR'`,
    [],
    { outFormat: oracledb.OUT_FORMAT_OBJECT } // <-- Change this line!
  );
  res.json(result.rows);
}

module.exports = {
  login,
  register,
  getDoctors,
};
