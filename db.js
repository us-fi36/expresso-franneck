import mariadb from 'mariadb';
import http from 'http'; 

const pool = mariadb.createPool({
    host: 'localhost',
    user: 'ben',
    password: 'passwort',
    database: 'todo_list',
    connectionLimit: 5
});

async function fetchTodos() {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('SELECT * FROM todos');
        console.log(rows);
        return rows;
    } catch (err) {
        console.error('Fehler beim Abrufen der Daten:', err);
        return [];
    } finally {
        if (conn) conn.release();
    }
}

const server = http.createServer(async (req, res) => {

    const todos = await fetchTodos();


    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(todos));
});

server.listen(3000, () => {
    console.log('Server running at http://localhost:3000/');
});
