// ============================================
// ESTADO DA APLICAÇÃO
// ============================================

let pixTimer = null;
let timeRemaining = 900; // 15 minutos em segundos

// ============================================
// NOTIFICAÇÕES TOAST
// ============================================

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ============================================
// GERAR QR CODE
// ============================================

function generateQRCode(pixCode) {
    const container = document.getElementById('qrcodeContainer');
    container.innerHTML = '';
    
    try {
        QRCode.toCanvas(pixCode, {
            width: 256,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        }, function (error, canvas) {
            if (error) {
                console.error('❌ Erro ao gerar QR Code:', error);
                container.innerHTML = '<p style="color: red;">Erro ao gerar QR Code</p>';
            } else {
                console.log('✅ QR Code gerado com sucesso');
                container.appendChild(canvas);
            }
        });
    } catch (error) {
        console.error('❌ Erro ao gerar QR Code:', error);
        container.innerHTML = '<p style="color: red;">Erro ao gerar QR Code</p>';
    }
}

// ============================================
// EXIBIR DETALHES DO PAGAMENTO PIX
// ============================================

function showPixPaymentDetails(paymentResult) {
    console.log('📋 Exibindo detalhes do pagamento Pix');
    
    const pixCodeText = document.getElementById('pixCode');
    const pixQrCodeContainer = document.getElementById('qrcodeContainer');
    
    if (paymentResult.pix && paymentResult.pix.qrcode) {
        const pixCode = paymentResult.pix.qrcode;
        
        // Exibir código Pix
        pixCodeText.value = pixCode;
        
        // Gerar QR Code visual
        generateQRCode(pixCode);
        
        console.log('✅ Checkout concluído com sucesso');
    } else {
        console.error('❌ Dados do PIX não encontrados');
        pixQrCodeContainer.innerHTML = '<p style="color: red;">Não foi possível obter os dados do PIX.</p>';
        pixCodeText.value = 'Tente novamente.';
    }
    
    // Iniciar timer
    startPixTimer();
}

// ============================================
// TIMER DO PIX
// ============================================

function startPixTimer() {
    timeRemaining = 900; // Reset para 15 minutos
    const timerElement = document.getElementById('pixTimer');
    
    if (pixTimer) {
        clearInterval(pixTimer);
    }
    
    pixTimer = setInterval(() => {
        timeRemaining--;
        
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeRemaining <= 0) {
            clearInterval(pixTimer);
            showToast('Código Pix expirado. Gere um novo código.', 'error');
        }
    }, 1000);
}

// ============================================
// COPIAR CÓDIGO PIX
// ============================================

function copyPixCode() {
    const pixCodeInput = document.getElementById('pixCode');
    pixCodeInput.select();
    pixCodeInput.setSelectionRange(0, 99999);
    
    navigator.clipboard.writeText(pixCodeInput.value).then(() => {
        showToast('Código Pix copiado!', 'success');
    }).catch(() => {
        document.execCommand('copy');
        showToast('Código Pix copiado!', 'success');
    });
}

// ============================================
// VOLTAR AO FORMULÁRIO
// ============================================

function backToForm() {
    if (pixTimer) {
        clearInterval(pixTimer);
    }
    
    // Limpar dados do sessionStorage
    sessionStorage.removeItem('pixPaymentData');
    
    // Redirecionar para a página inicial
    window.location.href = 'index.html';
}

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🔄 Carregando página de pagamento');
    
    // Recuperar dados do pagamento do sessionStorage
    const paymentDataJson = sessionStorage.getItem('pixPaymentData');
    
    if (!paymentDataJson) {
        console.error('❌ Nenhum dado de pagamento encontrado');
        showToast('Sessão expirada. Redirecionando...', 'error');
        
        // Redirecionar para a página inicial após 2 segundos
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }
    
    try {
        const paymentData = JSON.parse(paymentDataJson);
        console.log('✅ Dados de pagamento recuperados:', paymentData);
        
        // Exibir detalhes do pagamento
        showPixPaymentDetails(paymentData);
        
    } catch (error) {
        console.error('❌ Erro ao processar dados de pagamento:', error);
        showToast('Erro ao carregar pagamento. Redirecionando...', 'error');
        
        // Redirecionar para a página inicial após 2 segundos
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }
    
    console.log('✅ Página de pagamento inicializada com sucesso');
});

// ============================================
// LIMPEZA AO SAIR DA PÁGINA
// ============================================

window.addEventListener('beforeunload', () => {
    if (pixTimer) {
        clearInterval(pixTimer);
    }
});
