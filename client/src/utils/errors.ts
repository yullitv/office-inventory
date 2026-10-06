import { ApiError } from '../api/http';

const messages: Record<string, string> = {
  VALIDATION_ERROR: 'Перевірте правильність заповнення полів',
  ITEM_NOT_FOUND: 'Річ не знайдено. Можливо, її вже видалили',
  EMPLOYEE_NOT_FOUND: 'Співробітника не знайдено',
  LOAN_NOT_FOUND: 'Видачу не знайдено',
  INVENTORY_NUMBER_TAKEN: 'Такий інвентарний номер уже використовується',
  ITEM_ON_LOAN: 'Річ зараз на руках. Спочатку позначте, що її повернули',
  ITEM_ALREADY_ON_LOAN: 'Цю річ уже видано іншому співробітнику',
  ITEM_NOT_AVAILABLE: 'Річ у ремонті або загублена, її не можна видати',
  DUE_DATE_IN_PAST: 'Дата повернення не може бути в минулому',
  PAYLOAD_TOO_LARGE: 'Занадто великий обсяг даних',
  LOAN_ALREADY_RETURNED: 'Цю річ уже повернули',
};

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (messages[error.code]) return messages[error.code];
    if (error.status >= 500) return 'Сервер недоступний або сталася помилка. Спробуйте пізніше';
    return error.message;
  }
  if (error instanceof TypeError) {
    return 'Сервер недоступний. Перевірте, що бекенд запущено';
  }
  return 'Щось пішло не так. Спробуйте ще раз';
}
