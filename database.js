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
                return reject(err);
            }

            db.query(sql, params, (err, result) => {
                db.detach();

                if (err) {
                    console.error("❌ Query Error:", err);
                    return reject(err);
                }

                const formattedResult = result.map(row => {
                    return Object.fromEntries(
                        Object.entries(row).map(([key, value]) => [key.toLowerCase(), value])
                    );
                });

                console.log("Query Result:", formattedResult);
                pool.destroy();
                resolve(formattedResult);
            });
        });
    });
}

module.exports = queryDatabase;
