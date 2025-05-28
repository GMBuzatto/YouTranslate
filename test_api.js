const https = require('https');
const http = require('http');

// Função para fazer requisições HTTP
function makeRequest(options, data) {
    return new Promise((resolve, reject) => {
        const protocol = options.port === 443 ? https : http;
        const req = protocol.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                try {
                    const jsonBody = JSON.parse(body);
                    resolve({ status: res.statusCode, data: jsonBody });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        if (data) {
            req.write(data);
        }
        req.end();
    });
}

// Teste do endpoint de validação
async function testValidateEndpoint() {
    console.log('🧪 Testando endpoint de validação...');
    
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/v1/video/validate',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    };

    const data = JSON.stringify({
        url: 'https://www.youtube.com/watch?v=i-8yg_YRafY&ab_channel=MrMammal'
    });

    try {
        const response = await makeRequest(options, data);
        console.log('✅ Status:', response.status);
        console.log('📄 Resposta:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

// Teste do endpoint de processamento
async function testProcessEndpoint() {
    console.log('\n🧪 Testando endpoint de processamento...');
    
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/v1/video/process',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    };

    const data = JSON.stringify({
        url: 'https://www.youtube.com/watch?v=i-8yg_YRafY&ab_channel=MrMammal',
        language: 'en',
        targetLanguage: 'pt'
    });

    try {
        const response = await makeRequest(options, data);
        console.log('✅ Status:', response.status);
        console.log('📄 Resposta:', JSON.stringify(response.data, null, 2));
        
        if (response.data.jobId) {
            console.log('🔄 Job ID criado:', response.data.jobId);
            // Aguardar um pouco e verificar o status
            setTimeout(() => checkJobStatus(response.data.jobId), 2000);
        }
    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

// Verificar status do job
async function checkJobStatus(jobId) {
    console.log('\n🧪 Verificando status do job:', jobId);
    
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: `/api/v1/video/job/${jobId}/status`,
        method: 'GET',
    };

    try {
        const response = await makeRequest(options);
        console.log('✅ Status:', response.status);
        console.log('📄 Resposta:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

// Executar testes
async function runTests() {
    console.log('🚀 Iniciando testes da API YouTranslate\n');
    
    await testValidateEndpoint();
    await testProcessEndpoint();
}

runTests().catch(console.error); 