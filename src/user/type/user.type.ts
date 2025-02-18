export interface IUser {
  /** ID - Идентификатор пользователя */
  ID: string;

  /** External code - Внешний код */
  XML_ID: string;

  /** Activity - Активность */
  ACTIVE: string;

  /** First Name - Имя */
  NAME: string;

  /** Last Name - Фамилия */
  LAST_NAME: string;

  /** Middle Name - Отчество */
  SECOND_NAME: string;

  /** IUser List - Список пользователей */
  TITLE: string;

  /** E-Mail - Электронная почта */
  EMAIL: string;

  /** Last Login - Последний вход */
  LAST_LOGIN: string;

  /** Registration Date - Дата регистрации */
  DATE_REGISTER: string;

  /** TIME_ZONE - Часовой пояс */
  TIME_ZONE: string;

  /** IS_ONLINE - В сети */
  IS_ONLINE: string;

  /** TIME_ZONE_OFFSET - Смещение часового пояса */
  TIME_ZONE_OFFSET: string;

  /** TIMESTAMP_X - Временная метка обновления */
  TIMESTAMP_X: string;

  /** LAST_ACTIVITY_DATE - Дата последней активности */
  LAST_ACTIVITY_DATE: string;

  /** Gender - Пол */
  PERSONAL_GENDER: string;

  /** Profession - Профессия */
  PERSONAL_PROFESSION: string;

  /** Homepage - Домашняя страница */
  PERSONAL_WWW: string;

  /** Birthday - День рождения */
  PERSONAL_BIRTHDAY: string;

  /** Photo - Фотография */
  PERSONAL_PHOTO: string;

  /** ICQ - ICQ */
  PERSONAL_ICQ: string;

  /** Personal Phone - Личный телефон */
  PERSONAL_PHONE: string;

  /** Fax - Факс */
  PERSONAL_FAX: string;

  /** Personal Mobile - Личный мобильный */
  PERSONAL_MOBILE: string;

  /** Pager - Пейджер */
  PERSONAL_PAGER: string;

  /** Street Address - Улица */
  PERSONAL_STREET: string;

  /** City - Город */
  PERSONAL_CITY: string;

  /** Region / Territory - Регион / Область */
  PERSONAL_STATE: string;

  /** Postal Code - Почтовый индекс */
  PERSONAL_ZIP: string;

  /** Country - Страна */
  PERSONAL_COUNTRY: string;

  /** Mailbox - Почтовый ящик */
  PERSONAL_MAILBOX: string;

  /** Additional Notes - Дополнительные заметки */
  PERSONAL_NOTES: string;

  /** Company Phone - Телефон компании */
  WORK_PHONE: string;

  /** Company - Компания */
  WORK_COMPANY: string;

  /** Position - Должность */
  WORK_POSITION: string;

  /** Department - Отдел */
  WORK_DEPARTMENT: string;

  /** Company Website - Веб-сайт компании */
  WORK_WWW: string;

  /** WORK_FAX - Рабочий факс */
  WORK_FAX: string;

  /** WORK_PAGER - Рабочий пейджер */
  WORK_PAGER: string;

  /** WORK_STREET - Рабочий адрес */
  WORK_STREET: string;

  /** WORK_MAILBOX - Рабочий почтовый ящик */
  WORK_MAILBOX: string;

  /** City of Work - Город работы */
  WORK_CITY: string;

  /** WORK_STATE - Регион работы */
  WORK_STATE: string;

  /** WORK_ZIP - Почтовый индекс работы */
  WORK_ZIP: string;

  /** WORK_COUNTRY - Страна работы */
  WORK_COUNTRY: string;

  /** WORK_PROFILE - Профиль работы */
  WORK_PROFILE: string;

  /** WORK_LOGO - Логотип компании */
  WORK_LOGO: string;

  /** WORK_NOTES - Рабочие заметки */
  WORK_NOTES: string;

  /** Skype Chat Link - Ссылка на чат Skype */
  UF_SKYPE_LINK: string;

  /** Zoom - Zoom */
  UF_ZOOM: string;

  /** Employment Date - Дата устройства */
  UF_EMPLOYMENT_DATE: string;

  /** Time Management - Управление временем */
  UF_TIMEMAN: string;

  /** Departments - Отделы */
  UF_DEPARTMENT: string[];

  /** Interests - Интересы */
  UF_INTERESTS: string;

  /** Skills - Навыки */
  UF_SKILLS: string;

  /** Other Websites - Другие веб-сайты */
  UF_WEB_SITES: string;

  /** Xing - Xing */
  UF_XING: string;

  /** LinkedIn - LinkedIn */
  UF_LINKEDIN: string;

  /** Facebook - Facebook */
  UF_FACEBOOK: string;

  /** Twitter - Twitter */
  UF_TWITTER: string;

  /** Skype - Skype */
  UF_SKYPE: string;

  /** District - Район */
  UF_DISTRICT: string;

  /** Internal Phone - Внутренний телефон */
  UF_PHONE_INNER: string;

  /** USER_TYPE - Тип пользователя */
  USER_TYPE: string;
}

export interface TimeInfo {
  /** Start time - Время начала */
  start: number;

  /** Finish time - Время окончания */
  finish: number;

  /** Duration - Длительность */
  duration: number;

  /** Processing time - Время обработки */
  processing: number;

  /** Start date - Дата начала */
  date_start: string;

  /** Finish date - Дата окончания */
  date_finish: string;

  /** Operating - Операционная нагрузка */
  operating: number;
}

export interface ApiResponse {
  result: IUser;
  time: TimeInfo;
}
