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

const pool = Firebird.pool(5, options);

function queryDatabase(sql, params = []) {
    return new Promise((resolve, reject) => {
        pool.get((err, db) => {
            if (err) {
                console.error("Firebird Connection Error:", err);
                db.detach();
                return reject(err);
            }

            db.query(sql, params, (err, result) => {
                if (err) {
                    console.error("❌ Query Error:", err);
                    db.detach();
                    return reject(err);
                }

                if (sql.toLowerCase().startsWith('update') || sql.toLowerCase().startsWith('delete')) {
                    console.log("Query executed successfully.");
                    db.detach();
                    return resolve({ rowsAffected: result });
                }

                // Case for select query with results
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
    }).finally(() => {
        pool.destroy();
    });
}

queryDatabase("select * from users;")

// queryDatabase(`
//     CREATE TABLE users (
//     id INTEGER NOT NULL PRIMARY KEY,
//     username VARCHAR(255),
//     password VARCHAR(255),
//     email VARCHAR(255),
//     account_type VARCHAR(255)
// );`)

// queryDatabase(`
//     INSERT INTO users(id, username, password, email)
//     SELECT id, username, password, email
//     FROM new_users;
// `);

// queryDatabase("ALTER TABLE users ADD iv VARCHAR(200);")

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
