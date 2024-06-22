// Função para carregar os dados de treinamento do servidor
function loadTrainingData() {
    return fetch('/training-data')
        .then(response => response.json())
        .catch(() => ({}));
}

// Função para salvar os dados de treinamento no servidor
function saveTrainingData(data) {
    return fetch('/training-data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
}

// Função para calcular a distância de Levenshtein entre duas strings
function levenshtein(a, b) {
    const matrix = [];

    // Incremento de uma linha no início
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    // Incremento de uma coluna no início
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    // Preenchimento da matriz
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, // Substituição
                                        Math.min(matrix[i][j - 1] + 1, // Inserção
                                                 matrix[i - 1][j] + 1)); // Deleção
            }
        }
    }

    return matrix[b.length][a.length];
}

let trainingData = {};

document.getElementById('train-form')?.addEventListener('submit', async function(event) {
    event.preventDefault();
    const question = document.getElementById('question').value;
    const answer = document.getElementById('answer').value;
    
    trainingData[question.toLowerCase()] = answer;
    
    document.getElementById('question').value = '';
    document.getElementById('answer').value = '';
    alert('Pergunta e resposta adicionadas com sucesso!');
    
    await saveTrainingData(trainingData);
});

document.getElementById('chat-form')?.addEventListener('submit', async function(event) {
    event.preventDefault();
    const userInput = document.getElementById('user-input').value.toLowerCase();
    
    addMessage('user', userInput);
    
    if (Object.keys(trainingData).length === 0) {
        trainingData = await loadTrainingData();
    }

    const botResponse = findClosestMatch(userInput) || 'Desculpe, não entendi a pergunta.';
    addMessage('bot', botResponse);
    
    document.getElementById('user-input').value = '';
});

// Função para encontrar a pergunta mais próxima usando a distância de Levenshtein
function findClosestMatch(input) {
    let closestMatch = null;
    let minDistance = Infinity;

    for (let question in trainingData) {
        const distance = levenshtein(input, question);
        if (distance < minDistance) {
            minDistance = distance;
            closestMatch = question;
        }
    }

    // Retornar a resposta correspondente se a distância for razoavelmente pequena
    if (minDistance <= 3) { // Ajuste o limite conforme necessário
        return trainingData[closestMatch];
    }

    return null;
}

function addMessage(sender, text) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    messageDiv.textContent = text;
    document.getElementById('messages').appendChild(messageDiv);
    document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
}

(async function initialize() {
    trainingData = await loadTrainingData();
})();