import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

interface ReplyModalProps {
  visible: boolean;
  onClose: () => void;
}

const ReplyModal = ({visible, onClose}: ReplyModalProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
            <View style={styles.container}>
              {/* 헤더 */}
              <View style={styles.header}>
                <Text style={styles.title}>아이링의 답장 ✉️</Text>
              </View>

              {/* 답장 내용 */}
              <ScrollView
                style={styles.contentContainer}
                contentContainerStyle={styles.contentInner}>
                <Text style={styles.content}>
                  와, 2시간 동안 4게임 전부 이겼다니 정말 대단하다! 🎾 특히
                  포핸드가 잘 맞았다니, 평소 연습한 보람이 느껴졌겠다. 4게임을
                  뛰어다니려면 체력도 뒷받침되어야 했을 텐데, 대단하네. 다음
                  번에는 백핸드나 네트 플레이에서도 멋진 모습 보여줄 수 있도록
                  응원할게! 😊
                </Text>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#000',
    lineHeight: 24,
  },
  contentContainer: {
    maxHeight: '80%',
  },
  contentInner: {
    paddingBottom: 20,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: '#000',
  },
});

export default ReplyModal;
