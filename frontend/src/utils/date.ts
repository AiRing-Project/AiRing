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
export const getKoreanDay = (dateString: string) => {
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
export const formatSectionDate = (dateString: string) => {
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
export const formatKoreanDate = (dateString: string) => {
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
