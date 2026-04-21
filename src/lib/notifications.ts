import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { TripConfig } from '../types';

/**
 * Envia uma notificação silenciosa para o parceiro via WhatsApp usando a API do CallMeBot.
 * Ele busca a configuração do número de destino em trip_config no DB.
 */
export const sendWhatsAppNotification = async (message: string) => {
  try {
    const configSnap = await getDoc(doc(db, 'trip_config', 'main'));
    if (!configSnap.exists()) return;
    
    const { wppPhone, wppApiKey } = configSnap.data() as Partial<TripConfig>;

    // Verifica se o parceiro configurou o WhatsApp
    if (!wppPhone || !wppApiKey) return;

    // Formatar o telefone (remover +, () e manter apenas números)
    let phone = wppPhone.replace(/\D/g, '');
    
    // Adiciona o prefixo + na url (a API exige o + antes do DDI)
    if (!phone.startsWith('+')) {
      phone = '+' + phone;
    }

    const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(message)}&apikey=${wppApiKey}`;
    
    // CallMeBot REST API - usa no-cors devido à ausência de CORS no backend deles
    await fetch(url, { mode: 'no-cors' });
    console.log('[Net] WhatsApp push triggered para', phone);
  } catch (error) {
    console.error('Failed to send WhatsApp notification:', error);
  }
};
