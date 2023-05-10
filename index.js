const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const bodyParser = require('body-parser'); 
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const port = 3000; // Porta em que a API vai rodar

const connection = mysql.createConnection({
    host: 'programadordesistemas.mysql.database.azure.com',
    user: 'usuario_quiz',
    password: 'Quiz@123',
    database: 'guilherme'
});
  
connection.connect((err) => {
    if (err) throw err;
    console.log('Conexão com o banco de dados estabelecida!');
});
  
app.get('/', (req, res) => {    
    res.send('Alô mundo!');    
});

app.get('/perguntas', (req, res) => {
  connection.query('SELECT * FROM perguntas', (err, rows) => {
    if (err) throw err;
    const perguntas = [];
    rows.forEach(row => {
      const respostas = [row.resposta1, row.resposta2, row.resposta3, row.resposta4, row.resposta5].filter(resposta => resposta);
      perguntas.push({
        "id": `${row.id}`,
        "Pergunta": row.pergunta,
        "Respostas": respostas,
        "alternativa_correta": row.alternativacorreta
      });
    });
    res.send(perguntas);
  });
});

app.get('/perguntas_administracao', (req, res) => {
  connection.query('SELECT * FROM perguntas', (err, rows) => {
    if (err) throw err;
    const perguntas = [];
    rows.forEach(row => {
      const respostas = [row.resposta1, row.resposta2, row.resposta3, row.resposta4].filter(resposta => resposta);
      perguntas.push({
        "id": row.id,
        "Pergunta": row.pergunta,
        "resposta1": row.resposta1,
        "resposta2": row.resposta2,
        "resposta3": row.resposta3,
        "resposta4": row.resposta4,
        "alternativa_correta": row.alternativacorreta
      });
    });
    res.send(perguntas);
  });
});

app.get('/usuarios', (req, res) => {
    connection.query('SELECT * FROM usuarios', (err, rows) => {
      if (err) throw err;
      res.send(rows);
    });
});

app.post('/login', (req, res) => {
  const login = req.body.login;
  const senha = req.body.senha;
  connection.query('SELECT id, nome, login FROM usuarios WHERE login = ? AND senha = MD5(?)', [login, senha], (err, result) => {
    if (err) throw err;
    if (result.length > 0) {
      res.status(200).send(result);
    } else {
      res.status(401).send('Credenciais inválidas');
    }
  });
});

app.get('/perguntas/:id', (req, res) => {
    const id = req.params.id;
    connection.query('SELECT * FROM perguntas WHERE id = ?', [id], (err, rows) => {
      if (err) throw err;
      res.send(rows);
    });
  });
  
// POST /perguntas - Cria uma nova pergunta
app.post('/perguntas', (req, res) => {
  const { pergunta, resposta1, resposta2, resposta3, resposta4, alternativacorreta } = req.body;
  const query = `INSERT INTO perguntas (pergunta, resposta1, resposta2, resposta3, resposta4, alternativacorreta) VALUES (?, ?, ?, ?, ?, ?)`;
  connection.query(query, [pergunta, resposta1, resposta2, resposta3, resposta4, alternativacorreta], (err, results, fields) => {
    if (err) throw err;
    res.send('Pergunta criada com sucesso!');
  });
});

// PUT /perguntas/:id - Atualiza uma pergunta existente
app.put('/perguntas/:id', (req, res) => {
  const { pergunta, resposta1, resposta2, resposta3, resposta4, alternativacorreta } = req.body;
  const query = `UPDATE perguntas SET pergunta=?, resposta1=?, resposta2=?, resposta3=?, resposta4=?, alternativacorreta=? WHERE id=?`;
  connection.query(query, [pergunta, resposta1, resposta2, resposta3, resposta4, alternativacorreta, req.params.id], (err, results, fields) => {
    if (err) throw err;
    res.send('Pergunta atualizada com sucesso!');
  });
});

// DELETE /perguntas/:id - Exclui uma pergunta existente
app.delete('/perguntas/:id', (req, res) => {
  const query = `DELETE FROM perguntas WHERE id=?`;
  connection.query(query, [req.params.id], (err, results, fields) => {
    if (err) throw err;
    res.send('Pergunta excluída com sucesso!');
  });
});
  
// Inicia o servidor na porta 3000
app.listen(port, () => {
  console.log('Servidor iniciado na porta 3000');
});

  
