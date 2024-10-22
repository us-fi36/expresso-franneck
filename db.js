import mariadb from 'mariadb'

const pool = mariadb.createPool({
    host: 'localhost',
    user: 'ben',
    password: 'passwort',
    database: 'todo_list',
    connectionLimit: 5
});