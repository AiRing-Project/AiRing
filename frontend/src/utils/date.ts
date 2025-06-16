/**
 * 시간 포맷팅
 * @param isoString - ISO 8601 형식의 시간 문자열
 * @returns 오전/오후 HH시 MM분 형식의 시간 문자열
 */
export const formatTime = (isoString: string) => {
  const date = new Date(isoString);
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const isAM = hours < 12;
  let displayHour = hours % 12;
  if (displayHour === 0) {
    displayHour = 12;
  }
  const displayMinute = minutes.toString().padStart(2, '0');
  return `${isAM ? '오전' : '오후'} ${displayHour}시 ${displayMinute}분`;
};

/**
 * 요일 포맷팅
 * @param dateString - ISO 8601 형식의 시간 문자열
 * @returns 한글 요일 문자열
 */
export const getKoreanDay = (dateString: string | Date) => {
  const days = [
    '일요일',
    '월요일',
    '화요일',
    '수요일',
    '목요일',
    '금요일',
    '토요일',
  ];
  const date = new Date(dateString);
  return days[date.getDay()];
};

/**
 * 섹션 날짜 포맷팅
 * @param dateString - ISO 8601 형식의 시간 문자열
 * @returns 일요일, 월요일, 화요일, 수요일, 목요일, 금요일, 토요일 형식의 시간 문자열
 */
export const formatSectionDate = (dateString: string | Date) => {
  const date = new Date(dateString);
  const day = date.getDate();
  const dayOfWeek = getKoreanDay(dateString);
  return `${day}일 ${dayOfWeek}`;
};

/**
 * YYYY년 M월 D일 포맷팅
 * @param dateString - ISO 8601 형식의 시간 문자열
 * @returns 2025년 5월 7일
 */
export const formatKoreanDate = (dateString: string | Date) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
};

/**
 * 주어진 Date(없으면 오늘)를 YYYY-MM-DD string으로 반환
 */
export const getDateString = (date?: Date) => {
  const d = date ? new Date(date) : new Date();
  return d.toISOString().split('T')[0];
};

/**
 * 특정 날짜가 해당 월(year, month)에 포함되는지 확인
 * @param dateString YYYY-MM-DD
 * @param year 년도
 * @param month 월(1~12)
 */
export const isDateInCurrentMonth = (
  dateString: string,
  year: number,
  month: number,
) => {
  const date = new Date(dateString);
  return date.getFullYear() === year && date.getMonth() + 1 === month;
};

/**
 * 주어진 날짜가 오늘 이후(미래)인지 여부
 */
export const isFuture = (dateString: string) => {
  // 입력값과 오늘을 YYYY-MM-DD로 변환해서 비교
  const inputDate = new Date(dateString);
  const inputDateString = getDateString(inputDate);
  const todayString = getDateString();
  return inputDateString > todayString;
};

/**
 * 초 단위를 mm:ss 형식으로 변환
 */
export const formatDuration = (sec: number) => {
  const m = Math.floor(sec / 60)
    .toString()
    .padStart(2, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

/**
 * HH:mm 형식의 시간 문자열을 받아, 현재 시각 기준으로 해당 시간까지 남은 ms를 반환
 * @param time HH:mm 형식 (예: '09:30')
 * @returns 남은 ms (음수 불가, 내일로 넘김)
 */
export const calcDelayMs = (time: string): number => {
  const [h, m] = time.split(':').map(Number);
  const now = new Date();
  const target = new Date();
  target.setHours(h, m, 0, 0);
  if (target <= now) {
    target.setDate(target.getDate() + 1);
  }
  return target.getTime() - now.getTime();
};

/**
 * 현재 시각 기준 n분 뒤의 HH:mm 문자열 반환
 * @param n 분 단위
 * @returns HH:mm 형식 문자열
 */
export const getTimeAfterMinutes = (n: number): string => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + n);
  const hh = now.getHours().toString().padStart(2, '0');
  const mm = now.getMinutes().toString().padStart(2, '0');
  return `${hh}:${mm}`;
};

/**
 * 주어진 시간과 요일에 가장 가까운 미래의 Date 객체를 반환합니다.
 * @param hour       0~23 사이의 시 (24시간 기준)
 * @param minute     0~59 사이의 분
 * @param dayOfWeek  0(일요일)~6(토요일)
 * @returns {Date}  가장 가까운 미래의 Date 객체
 */
export const getNextDate = (
  hour: number,
  minute: number,
  dayOfWeek: number,
): Date => {
  const now = new Date();

  // 오늘의 날짜에 목표 시간으로 세팅한 Date 객체 생성
  const target = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hour,
    minute,
    0,
    0,
  );

  const today = now.getDay(); // 0~6
  // 목표 요일까지 남은 일수 (mod 7)
  let daysUntil = (dayOfWeek - today + 7) % 7;

  // 같은 요일이면, 목표 시간이 이미 지났을 때는 7일 뒤로
  if (daysUntil === 0 && target <= now) {
    daysUntil = 7;
  }

  // 남은 일수만큼 더해주면 최종 목표 날짜 완성
  if (daysUntil > 0) {
    target.setDate(target.getDate() + daysUntil);
  }

  return target;
};

/**
 * HH:mm 형식의 시간 문자열을 Date 객체로 변환
 * @param time HH:mm 형식 (예: '09:30')
 * @returns 오늘 날짜의 해당 시각을 가진 Date 객체
 */
export const parseTimeToDate = (time: string): Date => {
  const [h, m] = time.split(':').map(Number);
  const d = new Date();
  d.setHours(h);
  d.setMinutes(m);
  d.setSeconds(0);
  d.setMilliseconds(0);
  return d;
};
