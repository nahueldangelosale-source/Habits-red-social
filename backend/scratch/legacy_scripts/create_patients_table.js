
const { Client } = require('pg');

const client = new Client({
    connectionString: "postgresql://neondb_owner:npg_IZT6Y5UHDNEW@ep-morning-bar-aijoseqb-pooler.c-4.us-east-1.aws.neon.tech/neondb",
    ssl: true
});

const createTableSQL = `
    CREATE TABLE IF NOT EXISTS patients (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        professional_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(255),
        age INTEGER NOT NULL,
        weight DOUBLE PRECISION NOT NULL,
        goal TEXT,
        created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
    );
`;

async function main() {
    try {
        await client.connect();
        console.log("Connected to NeonDB via Node.js");

        await client.query(createTableSQL);
        console.log("Table 'patients' created successfully!");

        await client.end();
    } catch (err) {
        console.error("Error executing SQL:", err);
        process.exit(1);
    }
}

main();
