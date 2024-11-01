import express from "express";
import http from "http";
import sqlite3 from "sqlite3";
import bcrypt from "bcrypt";
import z from "zod";

// Create the express server
const app = express();
app.use(express.json());
const server = http.createServer(app);

// deliver static files from the client folder like css, js, images
app.use(express.static("client"));
// route for the homepage
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/client/index.html");
});

const initializeAPI = async (app) => {
  app.post("/api/login", login);
};
//ZOD :D
const userSchema = z.object({
  username: z.string().email(),
  password: z.string().min(10),
});

const login = async (req, res) => {
  const input = userSchema.safeParse(req.body);
  if (!input.success) {
    return res.status(400).send(input.error.issues);
  }
  const { username, password } = input.data;
  const answer = `
    <h1>Answer</h1>
    <p>Username: ${username}</p>
    <p>Password: ${password}</p>
  `;

  res.send(answer);
};

//Create DB Setup
function dbinit() {
  const db = new sqlite3.Database("./database.db", (err) => {
    if (err) {
      console.error("Could not connect to database", err);
    } else {
      console.log("Connected to database");
    }
    db.serialize(() => {
      db.run(
        "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT UNIQUE, password TEXT, role TEXT)"
      );
      const hashedAdminPassword = bcrypt.hashSync("admin", 10);
      db.run("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", [
        "admin",
        hashedAdminPassword,
        "admin",
      ]);
    });
  });
}
// Route for login
app.post('/', (req, res) => {
  const { username, password } = req.body;
  db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
      if (err) {
          res.status(500).json({ error: err.message });
          return;
      }
      if (!user || !bcrypt.compareSync(password, user.password)) {
          res.status(401).json({ error: 'Invalid credentials' });
          return;
      }
      /*
      const token = jwt.sign({ username: user.username, role: user.role }, SECRET_KEY);
      res.json({ token });
      */
  });
});

//Initialize the DB
dbinit(app);

// Initialize the REST api
initializeAPI(app);

//start the web server
const serverPort = 3001;
server.listen(serverPort, () => {
  console.log(`Express Server started on port ${serverPort}`);
});
