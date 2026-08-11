import express from "express";
import cors from "cors";
import pg from "pg";

const app = express();

app.use(cors({
	origin: '*'
}));
app.use(express.json({ limit: "10mb" }));

const pool = new pg.Pool({
    host: "localhost",
    port: 5432,
    database: "Registrar",
    user: "postgres",
    password: "admin123",
});

function excelDateToString(serial) {
    if (!serial) return null;
    if (isNaN(serial)) return String(serial);
    const date = new Date((serial - 25569) * 86400 * 1000);
    return date.toISOString().split("T")[0];
}

app.get("/api/students/search/:query", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM students 
            WHERE stud_no::text ILIKE $1 
            OR last_name ILIKE $1
            OR first_name ILIKE $1
            OR CONCAT(last_name, ' ', first_name) ILIKE $1
            OR CONCAT(first_name, ' ', last_name) ILIKE $1
            ORDER BY last_name ASC 
            LIMIT 10`,
            [`%${req.params.query}%`]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Search failed." });
    }
});

app.get("/api/students/:studNo", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM students WHERE stud_no = $1",
            [req.params.studNo]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Student not found." });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch student." });
    }
});

app.get("/api/export", async (req, res) => {
    const { year } = req.query;

    try {
        const query = year
            ? `SELECT * FROM students WHERE EXTRACT(YEAR FROM completion_date::date) = $1 ORDER BY last_name ASC`
            : `SELECT * FROM students ORDER BY last_name ASC`;

        const result = await pool.query(query, year ? [year] : []);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Export failed." });
    }
});

app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const result = await pool.query(
            "SELECT * FROM public.user WHERE username = $1 AND password = $2",
            [username, password]
        );
        
        if (result.rows.length === 0) {
            return res.status(401).json({ message: "Invalid username or password." });
        }

        const user = result.rows[0];
        res.json({ 
            message: "Login successful.",
            username: user.username,
            name: user.name,
            type: user.user_type,
            department: user.department
        });
        console.log(user);
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Login failed: " + err.message });
    }
});

app.put("/api/students/bulk-update", async (req, res) => {
    const { studNos, department, status, updatedBy } = req.body;

    const deptMap = {
        'Library':  'library',
        'Cashier':  'cashier',
        'HRM Lab':  'hrm_lab',
        'Com Lab':  'com_lab',
        'Guidance': 'guidance',
        'ProWare':  'proware',
        'OSA':      'osa',
        'E2E':      'e2e',
    };

    const column = deptMap[department];
    if (!column) return res.status(400).json({ message: 'Invalid department.' + department });
    try {
        await pool.query(
            `UPDATE students SET ${column} = $1, updated_by = $2 WHERE stud_no = ANY($3::text[])`,
            [status, updatedBy, studNos]
        );
        res.json({ message: `Updated ${studNos.length} students successfully.` });
        console.log(`Bulk updated ${studNos.length} students in ${column} to status: ${status}`);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Bulk update failed: ' + err.message });
    }
});

app.put("/api/students/:studNo/update", async (req, res) => {
    const { studNo } = req.params;
    const b = req.body;

    try {
        await pool.query(
            `UPDATE students SET
                last_name = $1, first_name = $2, middle_name = $3,
                email = $4, phone = $5,
                tor = $6, good_moral = $7, f137 = $8, f138 = $9,
                als_cert = $10, als_rating = $11,
                honor_dism = $12, birth_cert = $13, x_ray = $14, hepa = $15,
                confirmation = $16,                          -- added
                library = $17, cashier = $18, hrm_lab = $19, com_lab = $20,
                guidance = $21, proware = $22, osa = $23, e2e = $24,
                subjects = $25, remarks = $26,
                updated_by = $27
            WHERE stud_no = $28::bigint`,
            [
                b.surname, b.first_name, b.middle_name,
                b.email, b.phone,
                b.tor, b.good_moral, b.f137, b.f138,
                b.als_cert, b.als_rating,
                b.honor_dism, b.birth_cert, b.x_ray, b.hepa,
                b.confirmation,                              // added
                b.library, b.cashier, b.hrm_lab, b.com_lab,
                b.guidance, b.proware, b.osa, b.e2e,
                b.subjects, b.remarks,
                b.updatedBy,
                studNo
            ]
        );
        res.json({ message: "Student saved successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Save failed: " + err.message });
    }
});

app.post("/api/import", async (req, res) => {
    const rows = Array.isArray(req.body) ? req.body : req.body.rows;
    const meta = req.body.meta || { updatedBy: "Admin", completionDate: null };
    
    if (!rows || !Array.isArray(rows)) {
        return res.status(400).json({ message: "Invalid data: rows missing." });
    }

    try {
        for (const row of rows) {
            await pool.query(
                `INSERT INTO students (
                    stud_no, last_name, first_name, middle_name,
                    email, phone, course,
                    tor, good_moral, f137, f138,
                    als_cert, als_rating,
                    honor_dism, birth_cert, x_ray, hepa, confirmation,
                    library, cashier, hrm_lab, com_lab, guidance, proware, osa, e2e,
                    subjects, remarks, completion_date, updated_by
                ) VALUES (
                    $1,$2,$3,$4,$5,$6,$7,
                    $8,$9,$10,$11,
                    $12,$13,
                    $14,$15,$16,$17,$18,
                    $19,$20,$21,$22,$23,$24,$25,$26,
                    $27,$28,$29,$30
                )
                ON CONFLICT (stud_no) DO UPDATE SET
                    last_name = EXCLUDED.last_name,
                    first_name = EXCLUDED.first_name,
                    middle_name = EXCLUDED.middle_name,
                    course = EXCLUDED.course,
                    tor = EXCLUDED.tor,
                    good_moral = EXCLUDED.good_moral,
                    f137 = EXCLUDED.f137,
                    f138 = EXCLUDED.f138,
                    als_cert = EXCLUDED.als_cert,
                    als_rating = EXCLUDED.als_rating,
                    honor_dism = EXCLUDED.honor_dism,
                    birth_cert = EXCLUDED.birth_cert,
                    x_ray = EXCLUDED.x_ray,
                    hepa = EXCLUDED.hepa,
                    confirmation = EXCLUDED.confirmation,
                    library = EXCLUDED.library,
                    cashier = EXCLUDED.cashier,
                    hrm_lab = EXCLUDED.hrm_lab,
                    com_lab = EXCLUDED.com_lab,
                    guidance = EXCLUDED.guidance,
                    proware = EXCLUDED.proware,
                    osa = EXCLUDED.osa,
                    e2e = EXCLUDED.e2e,
                    subjects = EXCLUDED.subjects,
                    remarks = EXCLUDED.remarks,
                    completion_date = EXCLUDED.completion_date,
                    updated_by = EXCLUDED.updated_by`,
                [
                    String(row["STUDENT ID"]),
                    row["LAST NAME"],
                    row["FIRST NAME"],
                    row["MIDDLE NAME"],
                    "sample@email.com",
                    "+639000000000",
                    row["PROGRAM"],
                    row["TOR"]          || "Pending",
                    row["GOOD MORAL"]   || "Pending",
                    row["F137"]         || "Pending",
                    row["F138"]         || "Pending",
                    row["ALS CERT"]     || "N/A",
                    row["ALS RATING"]   || "N/A",
                    row["HONOR DISM"]   || "N/A",
                    row["BIRTH CERT"]   || "Pending",
                    row["X-RAY"]        || "N/A",
                    row["HEPA"]         || "N/A",
                    row["CONFIRMATION"] || "N/A",   // added
                    row["LIBRARY"]      || "Pending",
                    row["CASHIER"]      || "Pending",
                    row["HRM LAB"]      || "N/A",
                    row["COMLAB"]       || "N/A",
                    row["GUIDANCE"]     || "Pending",
                    row["PROWARE"]      || "Pending",
                    row["OSA"]          || "Pending",
                    row["E2E"]          || "Pending",
                    [row["SUBJECTS TO ENROLL"], row["SUBJECTS TO ENROLL_1"], row["SUBJECTS TO ENROLL_2"], row["SUBJECTS TO ENROLL_3"]]
                        .filter(s => s && s.toString().toLowerCase() !== "n/a")
                        .join(", ") || "None",
                    "None",
                    meta.completionDate || excelDateToString(row["COMPLETION DATE:"]) || null,
                    meta.updatedBy || row["UPDATED BY"] || null
                ]
            );
        }
        res.json({ message: `Imported ${rows.length} records successfully.` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Import failed: " + err.message });
    }
});

app.get("/api/users", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name, username, user_type, department
            FROM public.user
            ORDER BY name ASC`
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch users." });
    }
});

app.get("/api/users/search/:query", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name, username, user_type, department
             FROM public.user
             WHERE name       ILIKE $1
                OR username   ILIKE $1
                OR department ILIKE $1
             ORDER BY name ASC`,
            [`%${req.params.query}%`]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Search failed." });
    }
});

app.post("/api/users", async (req, res) => {
    const { name, username, password, user_type, department } = req.body;
 
    if (!name || !username || !password || !department) {
        return res.status(400).json({ message: "All fields are required." });
    }
 
    try {
        const result = await pool.query(
            `INSERT INTO public.user (name, username, password, user_type, department)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, name, username, user_type, department`,
            [name, username, password, user_type || "admin", department]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        if (err.code === "23505") {
            return res.status(409).json({ message: "Username already exists." });
        }
        res.status(500).json({ message: "Failed to add user: " + err.message });
    }
});

app.put("/api/users/:id", async (req, res) => {
    const { id } = req.params;
    const { name, username, password, user_type, department } = req.body;
 
    try {
        let result;
        if (password && password.trim() !== "") {
            result = await pool.query(
                `UPDATE public.user
                 SET name = $1, username = $2, password = $3, user_type = $4, department = $5
                 WHERE id = $6
                 RETURNING id, name, username, user_type, department`,
                [name, username, password, user_type, department, id]
            );
        } else {
            result = await pool.query(
                `UPDATE public.user
                 SET name = $1, username = $2, user_type = $3, department = $4
                 WHERE id = $5
                 RETURNING id, name, username, user_type, department`,
                [name, username, user_type, department, id]
            );
        }
 
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found." });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Update failed: " + err.message });
    }
});

app.delete("/api/users/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `DELETE FROM public.user WHERE id = $1 RETURNING id, name, username`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found." });
        }
        res.json({ message: "User deleted successfully.", user: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Delete failed: " + err.message });
    }
});

app.listen(3001, () => console.log("Server running on port 3001"));