/**
 * Backend yoki tarmoq xatolaridan tushunarli o'zbekcha matn ajratib beruvchi yordamchi funksiya
 */
export function getErrorMessage(err: any, fallbackMessage: string): string {
  if (!err) return fallbackMessage;

  // 1. Backend javobi (Axios error response)
  if (err.response?.data) {
    const data = err.response.data;

    // Massiv shaklidagi xabarlar (masalan, Zod bir nechta xatosi)
    if (Array.isArray(data.message)) {
      return data.message.join(', ');
    }

    // Satr shaklidagi xabarlar
    if (typeof data.message === 'string' && data.message.trim() !== '') {
      return data.message;
    }

    if (typeof data.error === 'string' && data.error.trim() !== '') {
      return data.error;
    }

    if (typeof data === 'string' && data.trim() !== '') {
      return data;
    }
  }

  // 2. Tarmoq yoki ulanish xatosi (Network error, CORS, Server unreachable)
  if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
    return "Server bilan ulanishda xatolik. Backend server ishlayotganini va tarmoqni tekshiring.";
  }

  // 3. Umumiy JS Error message
  if (typeof err.message === 'string' && err.message.trim() !== '') {
    return err.message;
  }

  return fallbackMessage;
}
