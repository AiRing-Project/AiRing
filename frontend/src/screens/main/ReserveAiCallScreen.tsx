import React, {useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import CallIcon from '../../assets/icons/call.svg';
import ToggleOffIcon from '../../assets/icons/toggle-off.svg';
import ToggleOnIcon from '../../assets/icons/toggle-on.svg';
import VibrateIcon from '../../assets/icons/vibrate.svg';
import VoiceIcon from '../../assets/icons/voice.svg';

const DAYS = ['월', '화', '수', '목', '금', '토', '일'];

// 옵션 타입 정의
type OptionType = 'vibrate' | 'call' | 'voice';

const ReserveAiCallScreen = () => {
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [hour, _setHour] = useState<number>(8); // 임시 값, 나중에 상태 관리 방식 변경 필요
  const [minute, _setMinute] = useState<number>(0); // 임시 값, 나중에 상태 관리 방식 변경 필요
  const [selectedOptions, setSelectedOptions] = useState<OptionType[]>([
    'vibrate',
    'call',
  ]);

  const toggleDay = (idx: number) => {
    setSelectedDays(prev =>
      prev.includes(idx) ? prev.filter(d => d !== idx) : [...prev, idx],
    );
  };

  const toggleOption = (option: OptionType) => {
    if (option === 'voice') {
      // console.log('AI 음성 옵션 클릭됨'); // 디버깅 구문 제거
      return;
    }
    setSelectedOptions(prev =>
      prev.includes(option)
        ? prev.filter(o => o !== option)
        : [...prev, option],
    );
  };

  return (
    <View style={styles.container}>
      {/* 상단 제목 */}
      <Text style={styles.title}>AI 전화 예약</Text>

      {/* 시간 선택 (Wheel Picker 대체 및 스타일 조정) */}
      <View style={styles.timePickerWrapper}>
        {' '}
        {/* 피그마 카드 배경 */}
        <View style={styles.timePickerContainer}>
          {' '}
          {/* 시간 표시 부분 컨테이너 */}
          {/* WheelPicker 구현 */}
          {/* 임시 시간 표시 (WheelPicker 대체 전) */}
          {/* 시간 표시 부분을 눌러서 시간 선택 휠이 뜨도록 구현 예정 */}
          <TouchableOpacity onPress={() => console.log('시간 선택 클릭')}>
            {' '}
            {/* TODO: 시간 선택 휠 띄우기 기능 추가 */}
            {/* 임시 시간 표시 UI */}
            <View style={styles.tempTimeDisplay}>
              {' '}
              {/* 임시 시간 표시 컨테이너 */}
              {/* 피그마의 오전/오후 텍스트 (왼쪽 배치) */}
              <Text style={styles.ampmTextLeft}>오전</Text>{' '}
              {/* TODO: 실제 오전/오후 상태에 따라 텍스트 변경 필요 */}
              <Text style={styles.tempTimeText}>
                {hour.toString().padStart(2, '0')}
              </Text>
              <Text style={styles.colon}>:</Text>
              <Text style={styles.tempTimeText}>
                {minute.toString().padStart(2, '0')}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* 반복 (요일 선택) */}
      <View style={styles.repeatContainer}>
        {' '}
        {/* 피그마 카드 배경 */}
        <Text style={styles.repeatTitle}>반복</Text>
        <View style={styles.daysContainer}>
          {' '}
          {/* 요일 버튼 컨테이너 */}
          {DAYS.map((d, i) => (
            <TouchableOpacity
              key={d}
              style={[
                styles.dayBtn,
                selectedDays.includes(i) && styles.dayBtnActive,
              ]}
              onPress={() => toggleDay(i)}>
              <Text
                style={[
                  styles.dayText,
                  selectedDays.includes(i) && styles.dayTextActive,
                ]}>
                {d}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 옵션 (진동, 다시 전화, AI 음성) */}
      <View style={styles.optionsContainer}>
        {' '}
        {/* 피그마 카드 배경 */}
        <Text style={styles.optionsTitle}>옵션</Text>
        <View style={styles.optionsList}>
          {' '}
          {/* 세로 나열 */}
          <TouchableOpacity
            style={styles.optionItem} // 각 옵션 항목 스타일
            onPress={() => toggleOption('vibrate')}>
            <View style={styles.optionIconLabel}>
              {' '}
              {/* 아이콘과 라벨 */}
              <VibrateIcon
                width={48}
                height={48}
                color={selectedOptions.includes('vibrate') ? '#000' : '#888'}
              />
              {/* 피그마 색상 참고 */}
              <View>
                {' '}
                {/* 라벨과 서브 텍스트 */}
                <Text
                  style={[
                    styles.optionLabel,
                    selectedOptions.includes('vibrate') &&
                      styles.optionLabelActive,
                  ]}>
                  진동
                </Text>
                <Text style={styles.optionSubLabel}>Basic call</Text>
              </View>
            </View>
            {/* 토글 스위치 */}
            {selectedOptions.includes('vibrate') ? (
              <ToggleOnIcon width={48} height={48} />
            ) : (
              <ToggleOffIcon width={48} height={48} />
            )}
          </TouchableOpacity>
          <View style={styles.separator} />
          {/* 구분선 */}
          <TouchableOpacity
            style={styles.optionItem} // 각 옵션 항목 스타일
            onPress={() => toggleOption('call')}>
            <View style={styles.optionIconLabel}>
              <CallIcon
                width={48}
                height={48}
                color={selectedOptions.includes('call') ? '#000' : '#888'}
              />
              {/* 피그마 색상 참고 */}
              <View>
                <Text
                  style={[
                    styles.optionLabel,
                    selectedOptions.includes('call') &&
                      styles.optionLabelActive,
                  ]}>
                  다시 전화
                </Text>
                <Text style={styles.optionSubLabel}>10분 후</Text>
              </View>
            </View>
            {/* 토글 스위치 */}
            {selectedOptions.includes('call') ? (
              <ToggleOnIcon width={48} height={48} />
            ) : (
              <ToggleOffIcon width={48} height={48} />
            )}
          </TouchableOpacity>
          <View style={styles.separator} />
          {/* 구분선 */}
          <TouchableOpacity
            style={styles.optionItem} // 각 옵션 항목 스타일
            onPress={() => toggleOption('voice')}>
            <View style={styles.optionIconLabel}>
              {' '}
              {/* 아이콘과 라벨 */}
              <VoiceIcon
                width={48}
                height={48}
                color={selectedOptions.includes('voice') ? '#000' : '#888'}
              />
              {/* 피그마 색상 참고 */}
              <View>
                {' '}
                {/* 라벨과 서브 텍스트 */}
                <Text
                  style={[
                    styles.optionLabel,
                    selectedOptions.includes('voice') &&
                      styles.optionLabelActive,
                  ]}>
                  AI 음성
                </Text>
                <Text style={styles.optionSubLabel}>Sol</Text>
              </View>
            </View>
            {/* AI 음성 옵션은 토글 없음 */}
          </TouchableOpacity>
        </View>
      </View>

      {/* 하단 버튼 */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.cancelBtn}>
          <Text style={styles.cancelText}>취소</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveBtn}>
          <Text style={styles.saveText}>저장</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7', // 피그마 배경색 반영
    paddingHorizontal: 20,
    paddingTop: 50, // 전체적으로 아래로 내리기 위해 상단 여백 증가
    paddingBottom: 30,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000', // 피그마 색상 반영
    textAlign: 'center',
    marginBottom: 30, // 피그마 여백 반영
  },
  timePickerWrapper: {
    // 시간 선택 섹션 전체 컨테이너 (피그마 흰색 카드)
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 20,
    marginBottom: 30, // 피그마 간격 반영
    alignItems: 'center',
    justifyContent: 'center',
  },
  timePickerContainer: {
    // 시간 표시 부분 컨테이너
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // WheelPicker 대체 임시 스타일 제거
  },
  wheelPicker: {
    // WheelPicker 스타일 (라이브러리 설치 후 사용)
    height: 150,
    width: 100,
  },

  repeatContainer: {
    // 반복 섹션 전체 컨테이너 (피그마 흰색 카드)
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 30, // 피그마 간격 반영
  },
  repeatTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 15,
  },
  daysContainer: {
    // 요일 버튼 컨테이너
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 0,
  },
  dayBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E4E4E4', // 기본 배경색
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayBtnActive: {
    backgroundColor: '#222222', // 선택된 배경색
  },
  dayText: {
    fontSize: 16,
    color: '#888', // 기본 텍스트 색상
    fontWeight: '600',
  },
  dayTextActive: {
    color: '#fff', // 선택된 텍스트 색상
  },

  optionsContainer: {
    // 옵션 섹션 전체 컨테이너 (피그마 흰색 카드)
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 40, // 피그마 간격 반영
  },
  optionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 15,
  },
  optionsList: {
    // 옵션 항목들을 담는 컨테이너 (세로 나열)
    flexDirection: 'column',
    gap: 0, // 각 옵션 항목 자체에 패딩/마진 적용
  },
  optionItem: {
    // 각 옵션 항목 (아이콘+라벨+토글)
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15, // 피그마 간격 참고
  },
  optionIconLabel: {
    // 아이콘과 라벨/서브라벨 컨테이너
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15, // 아이콘과 텍스트 사이 간격
  },
  optionLabel: {
    fontSize: 16,
    color: '#000', // 기본 텍스트 색상 (피그마)
    fontWeight: '500',
  },
  optionLabelActive: {
    color: '#222', // 선택된 텍스트 색상 (피그마)
    fontWeight: '600', // 선택된 텍스트 굵기 (피그마)
  },
  optionSubLabel: {
    // 서브 텍스트 스타일 (Basic call, 10분 후, Sol)
    fontSize: 12,
    color: '#888', // 피그마 색상 참고
    fontWeight: '400',
    marginTop: 2,
  },
  separator: {
    // 구분선 스타일
    height: 1,
    backgroundColor: '#F0F0F0', // 피그마 색상 참고
    marginVertical: 0, // 각 항목 내부에 패딩이 있으므로 구분선 마진 제거
  },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
    gap: 16,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#E4E4E4', // 피그마 색상 반영
    borderRadius: 10, // 피그마 라운드 반영
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#232323', // 피그마 색상 반영
    borderRadius: 10, // 피그마 라운드 반영
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    color: '#232323', // 피그마 색상 반영
    fontSize: 16,
    fontWeight: '600',
  },
  saveText: {
    color: '#fff', // 피그마 색상 반영
    fontSize: 16,
    fontWeight: '600',
  },
  ampmTextLeft: {
    // 오전/오후 텍스트 스타일 (시간 표시 왼쪽에 배치)
    fontSize: 16,
    fontWeight: '600',
    color: '#222', // 피그마 색상 참고
    marginRight: 10, // 시간 표시와의 간격 조정
  },
  colon: {
    fontSize: 40,
    fontWeight: '600',
    color: '#222',
    marginHorizontal: 5,
  },
  tempTimeDisplay: {
    // 임시 시간 표시 컨테이너 스타일
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tempTimeText: {
    // 임시 시간/분 텍스트 스타일
    fontSize: 40,
    fontWeight: '600',
    color: '#222',
    width: 60, // 적절한 간격 확보
    textAlign: 'center',
  },
});

export default ReserveAiCallScreen;
