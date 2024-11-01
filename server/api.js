const z = require('zod')

const initializeAPI = async (app) => {
  app.post("/api/login", login);
};
//ZOD :D
const userSchema = z.object({
  username: z.string().email(),
  password: z.string().min(10).
})

const login = async (req, res) => {
  
  const input = userSchema.safeParse(req.body)
  if (!input.success) {
    return res.status(400).send(input.error.issues)
  }
  const { username, password } = input.data;
  const answer = `
    <h1>Answer</h1>
    <p>Username: ${username}</p>
    <p>Password: ${password}</p>
  `;

  res.send(answer);
};

module.exports = { initializeAPI };
