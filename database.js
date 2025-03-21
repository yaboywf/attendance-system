const Firebird = require("node-firebird");
require("dotenv").config();

const options = {
    host: process.env.FIREBIRD_HOST,
    port: process.env.FIREBIRD_PORT,
    database: process.env.FIREBIRD_DATABASE,
    user: process.env.FIREBIRD_USER,
    password: process.env.FIREBIRD_PASSWORD,
    lowercase_keys: false,
    role: null,
    pageSize: 4096,
    WireCrypt: process.env.FIREBIRD_WIRECRYPT,
};

// Create a pool of 5 connections
const pool = Firebird.pool(5, options);

function queryDatabase(sql, params = []) {
    return new Promise((resolve, reject) => {
        pool.get((err, db) => {
            if (err) {
                console.error("Firebird Connection Error:", err);
                return reject(err);  // Return here to avoid calling db.detach()
            }

            // Query execution
            db.query(sql, params, (err, result) => {
                if (err) {
                    console.error("❌ Query Error:", err);
                    db.detach();
                    return reject(err);
                }

                // Handling update or delete queries
                if (sql.toLowerCase().startsWith('update') || sql.toLowerCase().startsWith('delete')) {
                    console.log("Query executed successfully.");
                    db.detach();
                    return resolve({ rowsAffected: result });
                }

                // Handling select queries
                if (result && Array.isArray(result)) {
                    const formattedResult = result.map(row => {
                        return Object.fromEntries(
                            Object.entries(row).map(([key, value]) => [key.toLowerCase(), value])
                        );
                    });
                    console.log("Query Result:", formattedResult);
                    db.detach();
                    return resolve(formattedResult);
                } else {
                    console.log("Query executed successfully but no data returned.");
                    db.detach();
                    return resolve(result);
                }
            });
        });
    });
}

queryDatabase("select * from attendance;")

// queryDatabase(`
//     CREATE TABLE attendance (
//     id INTEGER NOT NULL PRIMARY KEY,
//     user_id VARCHAR(255) NOT NULL,
//     attendance_datetime VARCHAR(255) NOT NULL,
//     updated_datetime VARCHAR(255) NOT NULL,
//     status VARCHAR(255) NOT NULL,
//     remarks VARCHAR(500)
// );`)

// queryDatabase(`
//     INSERT INTO users(id, username, password, email)
//     SELECT id, username, password, email
//     FROM new_users;
// `);

// queryDatabase("DROP TABLE new_users;")

// queryDatabase("ALTER TABLE users ADD iv VARCHAR(255);")

// queryDatabase("UPDATE users SET iv = ? WHERE id = 0;", ["1fc055638a0e0fdddb1b881ea44f0226"])

// queryDatabase(`SELECT
//     r.rdb$constraint_name AS fk_name
// FROM
//     rdb$ref_constraints r
// JOIN
//     rdb$relation_constraints c ON r.rdb$constraint_name = c.rdb$constraint_name
// WHERE
//     c.rdb$relation_name = 'FORMS' AND c.rdb$constraint_type = 'FOREIGN KEY';
// `)

module.exports = queryDatabase;
