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
                return reject(err);
            }

            // Query execution
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

module.exports = queryDatabase;