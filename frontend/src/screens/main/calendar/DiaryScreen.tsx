import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useEffect, useRef, useState} from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';

import {RootStackParamList} from '../../../../App';
import HorizontalDivider from '../../../components/common/HorizontalDivider';
import AppScreen from '../../../components/layout/AppScreen';
import ModeHeader from '../../../components/layout/ModeHeader';
import {Mode} from '../../../types/diary';
import {formatKoreanDate, getKoreanDay} from '../../../utils/date';

// TODO: 데이터 연동 후 삭제
const mockDiary = {
  id: 1,
  date: new Date('2025-05-16'),
  title: '오늘의 일기',
  content: `하루종일 이것저것 했는데, 막상 기억에 남는 건 별로 없는 그런 날. 기분이 나쁜 건 아닌데 딱히 좋지도 않고… 뭔가 애매한 상태
같아.. 그래도 AIRING한테 그냥 주절주절 얘기하다 보니, 생각 정리가 좀 됐어. 누가 대신 말 걸어주니까 말문이 트이는 느낌이
랄까?

특별할 것 없는 하루였지만, 이렇게라도 남기니까 괜히 의미 있어지는 기분이다 :)`,
  emotion: ['기쁜', '만족스러운'],
  images: ['https://picsum.photos/1080/1920', 'https://picsum.photos/800/800'],
};

const MAX_IMAGES = 10;

const DiaryScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'Diary'>>();
  const [mode, setMode] = useState<Mode>(route.params.mode);
  const [content, setContent] = useState<string>(mockDiary.content);
  const [tempContent, setTempContent] = useState<string>('');
  const [images, setImages] = useState<string[]>(mockDiary.images);
  const [tempImages, setTempImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null,
  );
  const imageScrollViewRef = useRef<ScrollView>(null);

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // 모드가 변경될 때 임시 상태 초기화
  useEffect(() => {
    if (mode === 'edit') {
      setTempContent(content);
      setTempImages(images);
    }
  }, [mode, content, images]);

  const handleImagePick = async () => {
    if (tempImages.length >= MAX_IMAGES) {
      return;
    }

    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 1,
    });

    if (result.assets && result.assets[0]?.uri) {
      const newImages = [...tempImages, result.assets[0].uri];
      setTempImages(newImages);
      // 이미지 추가 후 스크롤을 오른쪽 끝으로 이동
      setTimeout(() => {
        imageScrollViewRef.current?.scrollToEnd({animated: true});
      }, 100);
    }
  };

  const handleDeleteImage = (index: number) => {
    const newImages = [...tempImages];
    newImages.splice(index, 1);
    setTempImages(newImages);

    // 스크롤 위치 조정
    setTimeout(() => {
      if (newImages.length === 0) {
        // 이미지가 없으면 맨 왼쪽으로
        imageScrollViewRef.current?.scrollTo({x: 0, animated: true});
      } else if (index === tempImages.length - 1) {
        // 마지막 이미지를 삭제한 경우, 새로운 마지막 이미지로
        imageScrollViewRef.current?.scrollToEnd({animated: true});
      } else {
        // 그 외의 경우, 삭제된 이미지의 왼쪽 이미지 위치로
        const scrollPosition = Math.max(0, (index - 1) * (100 + 8)); // 이미지 너비 + 간격
        imageScrollViewRef.current?.scrollTo({
          x: scrollPosition,
          animated: true,
        });
      }
    }, 100);
  };

  const handleImagePress = (index: number) => {
    if (mode === 'edit') {
      handleDeleteImage(index);
    } else {
      setSelectedImageIndex(index);
    }
  };

  const handleCloseImageModal = () => {
    setSelectedImageIndex(null);
  };

  const handleSave = () => {
    setContent(tempContent);
    setImages(tempImages);
    // TODO: 실제 api로 저장
    setMode('read');
    imageScrollViewRef.current?.scrollTo({x: 0, animated: false});
  };

  const handleCancel = () => {
    setMode('read');
  };

  const renderImageModal = () => {
    if (selectedImageIndex === null) {
      return null;
    }

    return (
      <Modal
        visible={selectedImageIndex !== null}
        transparent={true}
        onRequestClose={handleCloseImageModal}>
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={handleCloseImageModal}>
            <Text style={styles.modalCloseButtonText}>✕</Text>
          </TouchableOpacity>
          <FlatList
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={selectedImageIndex}
            getItemLayout={(data, index) => ({
              length: Dimensions.get('window').width,
              offset: Dimensions.get('window').width * index,
              index,
            })}
            renderItem={({item}) => (
              <Image
                source={{uri: item}}
                style={styles.modalImage}
                resizeMode="contain"
              />
            )}
            keyExtractor={(_, index) => index.toString()}
          />
        </View>
      </Modal>
    );
  };

  return (
    <AppScreen>
      <ModeHeader
        title={`${formatKoreanDate(mockDiary.date)} ${getKoreanDay(
          mockDiary.date,
        )}`}
        marginBottom={25}
        mode={mode}
        onBackPress={() => navigation.goBack()}
        onCancel={handleCancel}
        onModeChange={setMode}
        onSave={handleSave}
      />
      <HorizontalDivider style={{height: 4, marginBottom: 28}} />

      <ScrollView
        contentContainerStyle={{paddingBottom: 24}}
        keyboardShouldPersistTaps="handled">
        {mode === 'read' ? (
          <>
            <Text style={styles.content}>{content}</Text>
          </>
        ) : (
          <>
            <TextInput
              style={[styles.content, styles.contentInput]}
              value={tempContent}
              onChangeText={setTempContent}
              placeholder="오늘 하루를 일기로 기록해볼까요?"
              placeholderTextColor="rgba(0, 0, 0, 0.3)"
              multiline
              scrollEnabled={false}
            />
          </>
        )}

        <View style={styles.imageSection}>
          <View style={styles.imageSectionHeader}>
            <Text style={styles.imageSectionTitle}>사진</Text>
            <Text style={styles.imageCount}>
              ({(mode === 'read' ? images : tempImages).length}/{MAX_IMAGES})
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            ref={imageScrollViewRef}>
            <View style={styles.imageList}>
              {(mode === 'read' ? images : tempImages).map((image, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleImagePress(index)}
                  style={styles.imageContainer}>
                  <Image source={{uri: image}} style={styles.image} />
                  {mode === 'edit' && (
                    <View style={styles.deleteButton}>
                      <Text style={styles.deleteButtonText}>×</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
              {mode === 'edit' && tempImages.length < MAX_IMAGES && (
                <TouchableOpacity
                  onPress={handleImagePick}
                  style={styles.addImageButton}>
                  <Text style={styles.addImageButtonText}>+</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      </ScrollView>

      {renderImageModal()}
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  editButton: {
    padding: 8,
  },
  editButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  dateContainer: {
    marginBottom: 20,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
  },
  content: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(0, 0, 0, 0.9)',
    minHeight: 50,
  },
  contentInput: {
    padding: 0,
    textAlignVertical: 'top',
    includeFontPadding: false,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
    padding: 0,
  },
  emotionContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  imageSection: {
    marginTop: 24,
  },
  imageSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  imageSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  imageCount: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.5)',
    marginLeft: 8,
  },
  imageList: {
    flexDirection: 'row',
    gap: 12,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.5)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  addImageButtonText: {
    fontSize: 32,
    color: '#999',
    lineHeight: 32,
  },
  editControls: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  undoButton: {
    padding: 8,
  },
  undoButtonDisabled: {
    opacity: 0.5,
  },
  undoButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  undoButtonTextDisabled: {
    color: '#999',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    padding: 8,
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 24,
  },
  modalImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  deleteButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 18,
    lineHeight: 18,
    fontWeight: 'bold',
  },
});

export default DiaryScreen;
