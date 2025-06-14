import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import IcBack from '../../assets/icons/ic-back.svg';
import IcCamera from '../../assets/icons/ic-camera.svg';
// 새로 추가된 아이콘 임포트
import IcReturn from '../../assets/icons/ic-return.svg';
import IcSmile from '../../assets/icons/ic-smile.svg';
import IcText from '../../assets/icons/ic-text.svg';
import IcWrite from '../../assets/icons/ic-write.svg';
import AppScreen from '../../components/layout/AppScreen';

const DiaryEntryScreen = () => {
  return (
    <AppScreen>
      {/* 상단 상태바 */}
      <View style={styles.androidStatusBar}>
        <Text style={styles.statusBarTime}>12:30</Text>
        <View style={styles.statusBarIcons}>
          {/* <Cellular width={18} height={12} /> */}
          {/* <Wifi width={16} height={12} /> */}
          {/* <Battery width={24} height={12} /> */}
        </View>
      </View>

      {/* 헤더 섹션 */}
      <View style={styles.headerSection}>
        <TouchableOpacity style={styles.backButton}>
          <IcBack width={24} height={24} />
        </TouchableOpacity>
        <Text style={styles.dateText}>5월 21일 수요일</Text>
        <View style={styles.headerRightIcons}>
          {/* 편집, 삭제, 공유 아이콘 위치 - Figma 디자인에 명시되지 않아 비워둠 */}
        </View>
      </View>

      {/* 일기 내용 */}
      <ScrollView style={styles.contentScrollView}>
        <Text style={styles.diaryContentText}>
          {
            '오전엔 멀쩡했는데, 오후엔 울적했어요... 회사에서 오전에 회의를 했었는데, 실수하는 바람에 상사분한테 크게 혼이 났거든요.\n그 뒤로 자꾸 위축되면서, 평소처럼 행동도 못 하고 말수도 줄었어요. 일이 끝나고 집에 와서도 머릿속에 자꾸 그 순간이 맴돌았고, \n괜히 내가 너무 부족한 사람처럼 느껴졌어요.\n오늘은 그냥... 빨리 자고 내일 다시 힘이 났으면 좋겠어요.'
          }
        </Text>
      </ScrollView>

      {/* 하단 액션 바 (Figma Rectangle 14961) */}
      <View style={styles.bottomActionBar}>
        <TouchableOpacity
          style={[styles.bottomIconContainer, styles.writeIcon]}>
          <IcWrite width={18} height={18} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.bottomIconContainer, styles.textIcon]}>
          <IcText width={21} height={20} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.bottomIconContainer, styles.smileIcon]}>
          <IcSmile width={20} height={20} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.bottomIconContainer, styles.cameraButton]}>
          <IcCamera width={20} height={18} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.bottomIconContainer, styles.returnIcon]}>
          <IcReturn width={24} height={24} />
        </TouchableOpacity>
      </View>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  androidStatusBar: {
    height: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FCFCFC',
    zIndex: 1,
  },
  statusBarTime: {
    fontFamily: 'Roboto-Medium',
    fontSize: 14,
    fontWeight: '500',
    color: '#170e2b',
  },
  statusBarIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 48,
    marginBottom: 20,
    paddingVertical: 10,
    backgroundColor: '#FBFBFB', // Figma Rectangle 14960 배경
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2, // Android 그림자
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 18,
    letterSpacing: 0.2,
    lineHeight: 20,
    fontWeight: '600',
    fontFamily: 'Pretendard',
    color: '#000',
    textAlign: 'center',
  },
  headerRightIcons: {
    flexDirection: 'row',
    gap: 15,
  },
  contentScrollView: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 25,
    paddingBottom: 120,
  },
  diaryContentText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    fontFamily: 'Pretendard',
    color: 'rgba(0, 0, 0, 0.9)',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  bottomActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50, // Figma Rectangle 14961 height
    backgroundColor: '#FFFFFF', // Figma Rectangle 14961 배경
    borderRadius: 5, // Figma Rectangle 14961 borderRadius
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3, // Android 그림자
    marginHorizontal: 20, // Figma Rectangle 14961 x:20
    position: 'absolute',
    bottom: 30, // Figma y: 837에서 계산된 위치
    left: 0,
    right: 0,
    paddingHorizontal: 0,
  },
  bottomIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 20,
    height: 20,
    position: 'absolute',
  },
  writeIcon: {
    left: 172, // write가 text 위치로 이동
  },
  textIcon: {
    left: 222, // text가 smile 위치로 이동
  },
  smileIcon: {
    left: 270, // smile이 camera 위치로 이동
  },
  cameraButton: {
    backgroundColor: '#D9D9D9',
    borderRadius: 5,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.65)',
    left: 320, // camera가 return 위치로 이동
  },
  returnIcon: {
    left: 30, // return이 write 위치로 이동
  },
});

export default DiaryEntryScreen;
