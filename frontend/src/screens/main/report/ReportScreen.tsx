import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import EllipseIcon from '../../../assets/icons/ic-Ellipse34.svg';
import EyeIcon from '../../../assets/icons/ic-eye.svg';
import GroupIcon from '../../../assets/icons/ic-Group.svg';
import UnionIcon from '../../../assets/icons/ic-Union.svg';
import VectorIcon from '../../../assets/icons/ic-Vector.svg';
import AnalysisText from '../../../components/AnalysisText';
import DateText from '../../../components/DateText';
import DiaryContentText from '../../../components/DiaryContentText';
import EmotionChart from '../../../components/EmotionChart';
import AppScreen from '../../../components/layout/AppScreen';
import LIGHT from '../../../components/LIGHT';
import MoveToDiaryText from '../../../components/MoveToDiaryText';
import Rectangle14955 from '../../../components/Rectangle14955';
import Rectangle14999 from '../../../components/Rectangle14999';
import Rectangle15000 from '../../../components/Rectangle15000';
import Rectangle15004 from '../../../components/Rectangle15004';
import Vector from '../../../components/Vector';
import Vector8Icon from '../../../components/Vector8Icon';

const ReportScreen = () => {
  return (
    <AppScreen scrollable>
      <View style={styles.headerSection}>
        <View style={styles.todayAndIconWrapper}>
          <Text style={styles.todayText}>오늘</Text>
          <TouchableOpacity style={styles.rightIconButton}>
            <Vector />
          </TouchableOpacity>
        </View>
        <View style={styles.infoIconRight}>
          <UnionIcon style={styles.unionIconAbsolute} />
          <VectorIcon style={styles.vectorIconAbsolute} />
          <EllipseIcon style={styles.ellipseIconAbsolute} />
          <GroupIcon style={styles.groupIconAbsolute} />
          <LIGHT style={styles.lightTextAbsolute} />
        </View>
      </View>

      {/* 평균 감정 섹션 */}
      <View style={styles.averageEmotionBox}>
        <Text style={styles.averageEmotionTitle}>평균 감정</Text>
        <View style={styles.emotionMetricsContainer}>
          <Text style={styles.emotionMetricText}>편안함 38%</Text>
          <Text style={styles.emotionMetricText}>즐거움 52%</Text>
        </View>
        <EyeIcon style={styles.eyeIconAbsolute} />
      </View>

      {/* 감정 변화 그래프 섹션 */}
      <View style={{marginHorizontal: 20, marginTop: 18}}>
        <EmotionChart />
      </View>

      {/* 그래프 분석 박스 -> Rectangle15004로 교체 */}
      <Rectangle15004
        style={{
          marginHorizontal: 20,
          marginTop: 15,
          paddingHorizontal: 40,
          paddingTop: 20,
        }}>
        <AnalysisText />
      </Rectangle15004>

      {/* 새로운 직사각형 추가 */}
      <Rectangle14955 style={{marginTop: 30}} />

      {/* 회고 일기 추천 섹션 -> Rectangle14999로 재구성 */}
      <Rectangle14999 style={{marginTop: 20, marginBottom: 62}}>
        <Text style={styles.diaryRecommendationTitle}>회고 일기 추천</Text>
        <View style={styles.recommendationMainBoxInside}>
          <DateText style={{marginTop: 21}} />
          <Rectangle15000
            style={{marginTop: 10, marginLeft: -7, marginRight: 8}}>
            <View style={styles.diaryContentBox}>
              <DiaryContentText />
            </View>
          </Rectangle15000>
          <TouchableOpacity style={styles.moveToDiaryButton}>
            <MoveToDiaryText />
            <Vector8Icon style={styles.vector8IconStyle} />
          </TouchableOpacity>
        </View>
      </Rectangle14999>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    paddingTop: 28, // 상태바 높이를 고려하여 패딩 추가
    flexGrow: 1, // 스크롤 가능한 콘텐츠가 충분한 공간을 차지하도록 보장
  },
  // AppScreen이 SafeArea 및 기본 패딩을 처리하므로, 여기서는 컨테이너 스타일을 최소화합니다.
  container: {
    flex: 1,
    backgroundColor: '#FCFCFC', // Figma의 배경색
  },
  // 상태바 스타일
  androidStatusBar: {
    height: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    position: 'absolute', // 상단에 고정
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fcfcfc', // 배경색
    zIndex: 1, // 다른 콘텐츠 위에 오도록 z-index 설정
  },
  statusBarTime: {
    fontFamily: 'Roboto-Medium', // Figma에 따라 폰트 변경
    fontSize: 14,
    fontWeight: '500',
    color: '#170e2b',
  },
  statusBarIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  // 헤더 섹션
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 40,
    position: 'relative',
  },
  todayAndIconWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  todayText: {
    fontFamily: 'Pretendard',
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  rightIconButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoIconRight: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{translateY: -14}],
  },
  vectorIconAbsolute: {
    position: 'absolute',
    right: 0,
    top: 3,
  },
  unionIconAbsolute: {
    position: 'absolute',
    right: 32,
    top: 0,
  },
  ellipseIconAbsolute: {
    position: 'absolute',
    right: 35,
    top: 3,
  },
  groupIconAbsolute: {
    position: 'absolute',
    right: 40,
    top: 8,
  },
  lightTextAbsolute: {
    position: 'absolute',
    right: 63,
    top: 4,
  },

  // 평균 감정 섹션
  averageEmotionBox: {
    borderRadius: 10,
    backgroundColor: '#F4F4F4',
    width: '90%',
    height: 99,
    marginHorizontal: '5%',
    marginBottom: 20,
    paddingLeft: 25,
    paddingRight: 25,
    justifyContent: 'center', // 텍스트 중앙 정렬
  },
  averageEmotionTitle: {
    fontFamily: 'Pretendard',
    fontSize: 18,
    fontWeight: '700',
    color: 'rgba(0, 0, 0, 0.85)',
    textAlign: 'left',
    position: 'absolute',
    top: 20,
    left: 25,
  },
  emotionMetricsContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 20,
    left: 25,
  },
  emotionMetricText: {
    fontFamily: 'Pretendard',
    fontSize: 14,
    fontWeight: '600',
    color: '#3F3F3F',
    marginRight: 20,
  },
  eyeIconAbsolute: {
    position: 'absolute',
    right: 43.5,
    top: 43.5,
  },

  // 회고 일기 추천 섹션 스타일 재구성
  diaryRecommendationTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Pretendard',
    color: 'rgba(0, 0, 0, 0.85)',
    textAlign: 'left',
  },
  recommendationMainBoxInside: {
    width: '100%',
    marginTop: 0,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  dateTextAbsolute: {
    // position: 'absolute', // 제거
    // top: 63, // 제거
    // left: 116, // 제거
    // right: 116, // 제거
    // textAlign: 'center',
  },
  diaryContentBox: {
    width: '100%',
    paddingVertical: 15,
    justifyContent: 'center',
    marginTop: 0,
    marginBottom: 0,
  },
  diaryMoveButton: {
    width: '100%',
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FFE066',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
  },
  diaryMoveButtonText: {
    fontSize: 14,
    letterSpacing: 0.1,
    lineHeight: 20,
    fontWeight: '500',
    fontFamily: 'Pretendard',
    color: '#999',
    textAlign: 'left',
  },
  moveToDiaryTextWrapper: {
    alignSelf: 'flex-end',
    marginRight: 20,
    marginTop: 20,
  },
  moveToDiaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginRight: 20,
    marginTop: 20,
  },
  vector8IconStyle: {
    marginLeft: 4, // 텍스트와 아이콘 사이의 간격
  },
});

export default ReportScreen;
