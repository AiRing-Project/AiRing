import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

const EmotionChart = () => {
  const maxBarHeight = 144.44;
  const data = [
    {day: '월', value: 10, color: '#F36A89'},
    {day: '화', value: 30, color: '#F36A89'},
    {day: '수', value: 70, color: '#FBC665'},
    {day: '목', value: 90, color: '#FBC665'},
    {day: '금', value: 40, color: '#7B8EF9'},
    {day: '토', value: 70, color: '#FBC665'},
    {day: '일', value: 60, color: '#6EC77B'},
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>감정 변화 그래프</Text>
      <View style={styles.graphContainer}>
        {/* Y축 눈금 */}
        <View style={styles.yAxis}>
          <Text style={styles.yLabel}>90</Text>
          <Text style={styles.yLabel}>50</Text>
          <Text style={styles.yLabel}>0</Text>
        </View>

        {/* 막대그래프 영역 */}
        <View style={styles.barContainer}>
          {data.map((item, index) => (
            <View key={index} style={styles.barItem}>
              <View
                style={{
                  width: 25,
                  height: (item.value / 100) * maxBarHeight,
                  backgroundColor: item.color,
                  borderRadius: 4,
                }}
              />
              <Text style={styles.dayText}>{item.day}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  title: {
    fontSize: 18,
    lineHeight: 20,
    fontWeight: '700',
    color: 'rgba(0, 0, 0, 0.85)',
    textAlign: 'left',
    alignItems: 'center',
    width: 175,
    height: 22,
    marginLeft: 20,
    marginBottom: 10,
  },
  graphContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingVertical: 10,
  },
  yAxis: {
    justifyContent: 'space-between',
    height: 144.44,
    marginRight: 8,
  },
  yLabel: {
    fontSize: 12,
    color: '#666',
  },
  barContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 144.44,
    flex: 1,
  },
  barItem: {
    alignItems: 'center',
    flex: 1,
  },
  dayText: {
    marginTop: 4,
    fontSize: 12,
    color: '#333',
  },
});

export default EmotionChart;
