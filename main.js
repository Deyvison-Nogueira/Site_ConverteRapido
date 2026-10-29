/**
 * ConverteRápido - Lógica Principal
 */

// --- FUNÇÕES UTILITÁRIAS ---

function obterValor(idElemento) {
    return document.getElementById(idElemento).value.trim();
}

function atualizarTela(idElemento, mensagem, ehErro = false) {
    const elemento = document.getElementById(idElemento);
    elemento.textContent = mensagem; 
    
    if (ehErro) {
        elemento.classList.add('erro');
    } else {
        elemento.classList.remove('erro');
    }
}

function validarEntrada(valor, idResultado) {
    if (valor === "") {
        atualizarTela(idResultado, "Digite um número!", true);
        return false;
    }
    return true;
}

// Função genérica para cálculos locais (Evita repetição de código)
function calcularConversaoLocal(idValor, idDe, idPara, idRes, fator, unidBase) {
    const valorEntrada = obterValor(idValor);
    if (!validarEntrada(valorEntrada, idRes)) return;

    const unidadeOrigem = obterValor(idDe);
    const unidadeDestino = obterValor(idPara);
    const valorNum = parseFloat(valorEntrada);
    
    let valorConvertido = valorNum;

    if (unidadeOrigem !== unidadeDestino) {
        // Se a origem for a unidade base (ex: milha, galão), multiplica. Senão, divide.
        if (unidadeOrigem === unidBase) {
            valorConvertido = valorNum * fator;
        } else {
            valorConvertido = valorNum / fator;
        }
    }

    // Identifica qual símbolo mostrar no resultado
    let simbolo = unidadeDestino;
    if (unidadeDestino === 'yd2') simbolo = 'yd²';
    if (unidadeDestino === 'm2') simbolo = 'm²';

    const textoFinal = valorConvertido.toFixed(2).replace('.', ',') + ` ${simbolo}`;
    atualizarTela(idRes, textoFinal);
}


// --- API: CONVERSÃO DE MOEDA ---

async function realizarConversaoMoeda() {
    const valorEntrada = obterValor('moeda-valor');
    if (!validarEntrada(valorEntrada, 'res-moeda')) return;

    const moedaOrigem = obterValor('moeda-de');
    const moedaDestino = obterValor('moeda-para');
    
    if (moedaOrigem === moedaDestino) {
        atualizarTela('res-moeda', parseFloat(valorEntrada).toFixed(2).replace('.', ',') + ` ${moedaDestino}`);
        return;
    }

    const urlApi = `https://economia.awesomeapi.com.br/json/last/${moedaOrigem}-${moedaDestino}`;

    try {
        atualizarTela('res-moeda', 'Buscando...'); 

        const resposta = await fetch(urlApi);
        if (!resposta.ok) throw new Error("Falha na API");

        const dados = await resposta.json();
        const chaveAcesso = `${moedaOrigem}${moedaDestino}`;
        const cotacaoAtual = parseFloat(dados[chaveAcesso].ask);
        
        const valorConvertido = (parseFloat(valorEntrada) * cotacaoAtual);
        const formatoMoeda = valorConvertido.toFixed(2).replace('.', ',') + ` ${moedaDestino === 'USD' ? '$' : 'R$'}`;
        
        atualizarTela('res-moeda', formatoMoeda);

    } catch (erro) {
        console.error(erro);
        atualizarTela('res-moeda', "Erro de conexão.", true);
    }
}


// --- EVENT LISTENERS (Vínculo dos botões) ---

document.getElementById('btn-moeda').addEventListener('click', realizarConversaoMoeda);

document.getElementById('btn-comp').addEventListener('click', () => {
    // 1 milha = 1.60934 km
    calcularConversaoLocal('comp-valor', 'comp-de', 'comp-para', 'res-comp', 1.60934, 'mi');
});

document.getElementById('btn-vol').addEventListener('click', () => {
    // 1 galão = 3.78541 litros
    calcularConversaoLocal('vol-valor', 'vol-de', 'vol-para', 'res-vol', 3.78541, 'gal');
});

document.getElementById('btn-massa').addEventListener('click', () => {
    // 1 libra = 0.453592 kg
    calcularConversaoLocal('massa-valor', 'massa-de', 'massa-para', 'res-massa', 0.453592, 'lb');
});

document.getElementById('btn-area').addEventListener('click', () => {
    // 1 jarda quadrada (terreno) = 0.836127 m2
    calcularConversaoLocal('area-valor', 'area-de', 'area-para', 'res-area', 0.836127, 'yd2');
});

document.getElementById('btn-vel').addEventListener('click', () => {
    // 1 mph = 1.60934 km/h
    calcularConversaoLocal('vel-valor', 'vel-de', 'vel-para', 'res-vel', 1.60934, 'mph');
});