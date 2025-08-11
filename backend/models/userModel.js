const { getConnection } = require('../config/db');

async function findUserByEmail(email) {
  const conn = await getConnection();
  const result = await conn.execute(
    'SELECT * FROM USERS WHERE EMAIL = :email',
    [email],
    { outFormat: 4001 }
  );
  return result.rows[0];
}

async function createUser(name, email, encryptedPassword, role) {
  const conn = await getConnection();
  await conn.execute(
    `INSERT INTO USERS (ID, NAME, EMAIL, PASSWORD, ROLE)
     VALUES (USERS_SEQ.NEXTVAL, :name, :email, :password, :role)`,
    [name, email, encryptedPassword, role],
    { autoCommit: true }
  );
}

module.exports = { findUserByEmail, createUser };
