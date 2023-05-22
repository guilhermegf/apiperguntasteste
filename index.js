const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const util = require('util');
const bodyParser = require('body-parser'); 
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const port = 8080; 

const pool = mysql.createPool({
  host: 'programadordesistemas.mysql.database.azure.com',
  user: 'usuario_quiz',
  password: 'Quiz@123',
  database: 'guilherme'
});

const query = util.promisify(pool.query).bind(pool);

pool.getConnection((err, connection) => {
  if (err) throw err;
  console.log('Conexão com o banco de dados estabelecida!');
});

app.get('/', (req, res) => {
  res.send('Alô mundo!');
});

// rota para todas as perguntas
app.get('/perguntas', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM perguntas');
    const perguntas = rows.map(row => {
      const respostas = [row.resposta1, row.resposta2, row.resposta3, row.resposta4, row.resposta5].filter(resposta => resposta);
      return {
        "id": `${row.id}`,
        "Pergunta": row.pergunta,
        "Respostas": respostas,
        "alternativa_correta": row.alternativacorreta
      };
    });
    res.send(perguntas);
  } catch (err) {
    console.error('Erro ao buscar perguntas: ' + err.stack);
    res.status(500).send('Erro ao buscar perguntas');
  }
});

app.get('/perguntas_administracao', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM perguntas');
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
  } catch (err) {
    throw err;
  }
});

app.get('/usuarios', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM usuarios');
    res.send(rows);
  } catch (err) {
    throw err;
  }
});

app.post('/login', async (req, res) => {
  const login = req.body.login;
  const senha = req.body.senha;
  try {
    const result = await query('SELECT id, nome, login FROM usuarios WHERE login = ? AND senha = MD5(?)', [login, senha]);
    if (result.length > 0) {
      res.status(200).send(result);
    } else {
      res.status(401).send('Credenciais inválidas');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro interno do servidor');
  }
});

app.get('/perguntas/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const rows = await query('SELECT * FROM perguntas WHERE id = ?', [id]);
    res.send(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro interno do servidor');
  }
});

app.post('/perguntas', async (req, res) => {
  const { pergunta, resposta1, resposta2, resposta3, resposta4, alternativacorreta } = req.body;
  const sql = `INSERT INTO perguntas (pergunta, resposta1, resposta2, resposta3, resposta4, resposta5, alternativacorreta) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  try {
    await query(sql, [pergunta, resposta1, resposta2, resposta3, resposta4, resposta4, alternativacorreta], (error, results, fields) => {
      if (error) {
        console.error(error);
        res.status(500).send('Erro interno do servidor 1');
        return;
      }
      res.send('Pergunta criada com sucesso!');
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro interno do servidor 2');
  }
});



// PUT /perguntas/:id - Atualiza uma pergunta existente
app.put('/perguntas/:id', async (req, res) => {
  const { pergunta, resposta1, resposta2, resposta3, resposta4, alternativacorreta } = req.body;
  const sql = `UPDATE perguntas SET pergunta=?, resposta1=?, resposta2=?, resposta3=?, resposta4=?, resposta4=?, alternativacorreta=? WHERE id=?`;
  try {
    const results = await query(sql, [pergunta, resposta1, resposta2, resposta3, resposta4, resposta4, alternativacorreta, req.params.id]);
    res.send('Pergunta atualizada com sucesso!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao atualizar pergunta');
  }
});

// DELETE /perguntas/:id - Exclui uma pergunta existente
app.delete('/perguntas/:id', async (req, res) => {
  const sql = `DELETE FROM perguntas WHERE id=?`;
  try {
    const results = await query(sql, [req.params.id]);
    res.send('Pergunta excluída com sucesso!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao excluir pergunta');
  }
});

  
// Inicia o servidor na porta 3000
app.listen(port, () => {
  console.log('Servidor iniciado na porta 3000');
});

  
