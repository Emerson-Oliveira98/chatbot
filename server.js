const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/training-data', (req, res) => {
    fs.readFile('treinar.json', 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Erro ao ler o arquivo de treinamento.');
            return;
        }
        res.send(data);
    });
});

app.post('/training-data', (req, res) => {
    const newTrainingData = req.body;
    fs.writeFile('treinar.json', JSON.stringify(newTrainingData, null, 2), (err) => {
        if (err) {
            res.status(500).send('Erro ao salvar os dados de treinamento.');
            return;
        }
        res.send('Dados de treinamento salvos com sucesso.');
    });
});

app.listen(process.env || port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});