interface IWorkGroup {
  /** Идентификатор группы */
  ID: number;

  /** Флаг Y/N - является ли группа активной */
  ACTIVE: 'Y' | 'N';

  /** Код темы (обязательное поле) */
  SUBJECT_ID: string;

  /** Поля тематики группы */
  SUBJECT_DATA?: Record<string, any>;

  /** Название группы */
  NAME: string;

  /** Описание группы */
  DESCRIPTION?: string;

  /** Ключевые слова */
  KEYWORDS?: string[];

  /** Флаг Y/N - является ли группа архивной */
  CLOSED: 'Y' | 'N';

  /** Флаг Y/N - видна ли группа в списке групп */
  VISIBLE: 'Y' | 'N';

  /** Флаг Y/N - открыта ли группа для свободного вступления */
  OPENED: 'Y' | 'N';

  /** Флаг Y/N - является ли группа проектом (по умолчанию - не является) */
  PROJECT: 'Y' | 'N';

  /** Флаг Y/N - является ли группой для публикаций */
  LANDING: 'Y' | 'N';

  /** Дата создания */
  DATE_CREATE: string;

  /** Дата изменения */
  DATE_UPDATE: string;

  /** Дата активности */
  DATE_ACTIVITY: string;

  /** Идентификатор файла аватара группы */
  IMAGE_ID?: number;

  /** URL аватара */
  AVATAR?: string;

  /** Данные о наборе существующих типов аватаров */
  AVATAR_TYPES?: string[];

  /** Тип аватара группы (используется, если не задано значение IMAGE_ID) */
  AVATAR_TYPE?: 'folder' | 'checks' | 'pie' | 'bag' | 'members';

  /** Идентификатор владельца группы */
  OWNER_ID: number;

  /** Поля владельца группы */
  OWNER_DATA?: Record<string, any>;

  /** Количество членов группы */
  NUMBER_OF_MEMBERS: number;

  /** Количество модераторов группы */
  NUMBER_OF_MODERATORS: number;

  /** Кто имеет право на приглашение пользователей в группу */
  INITIATE_PERMS: 'A' | 'E' | 'K';

  /** Дата начала проекта */
  PROJECT_DATE_START?: string;

  /** Дата завершения проекта */
  PROJECT_DATE_FINISH?: string;

  /** Идентификатор SCRUM */
  SCRUM_OWNER_ID?: number;

  /** Идентификатор SCRUM мастера */
  SCRUM_MASTER_ID?: number;

  /** Длительность спринта в скраме в секундах */
  SCRUM_SPRINT_DURATION?: number;

  /** Ответственный по умолчанию в скрам проекте */
  SCRUM_TASK_RESPONSIBLE?: 'A' | 'M';

  /** Теги группы */
  TAGS?: string[];

  /** Данные о доступных текущему пользователю операциях над группой */
  ACTIONS?: Record<string, any>;

  /** Данные о роли текущего пользователя в группе */
  USER_DATA?: Record<string, any>;
}
