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
import useDiaryStore from '../../../store/diaryStore';
import {Mode} from '../../../types/diary';
import {formatKoreanDate, getKoreanDay} from '../../../utils/date';

const MAX_IMAGES = 10;

const DiaryScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'Diary'>>();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {diaries, addDiary, updateDiary, getDiaryByDate} = useDiaryStore();

  const [mode, setMode] = useState<Mode>(route.params.mode);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [emotion, setEmotion] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [tempTitle, setTempTitle] = useState('');
  const [tempContent, setTempContent] = useState('');
  const [tempEmotion, setTempEmotion] = useState<string[]>([]);
  const [tempImages, setTempImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null,
  );
  const imageScrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (route.params.id) {
      const diary = diaries.find(d => d.id === route.params.id);
      if (diary) {
        setTitle(diary.title);
        setContent(diary.content);
        setEmotion(diary.emotion);
        setImages(diary.images);
      }
    } else if (route.params.date) {
      const diary = getDiaryByDate(route.params.date);
      if (diary) {
        setTitle(diary.title);
        setContent(diary.content);
        setEmotion(diary.emotion);
        setImages(diary.images);
      }
    }
  }, [route.params, diaries, getDiaryByDate]);

  useEffect(() => {
    if (mode === 'edit') {
      setTempTitle(title);
      setTempContent(content);
      setTempEmotion(emotion);
      setTempImages(images);
    }
  }, [mode, title, content, emotion, images]);

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
      setTimeout(() => {
        imageScrollViewRef.current?.scrollToEnd({animated: true});
      }, 100);
    }
  };

  const handleDeleteImage = (index: number) => {
    const newImages = [...tempImages];
    newImages.splice(index, 1);
    setTempImages(newImages);

    setTimeout(() => {
      if (newImages.length === 0) {
        imageScrollViewRef.current?.scrollTo({x: 0, animated: true});
      } else if (index === tempImages.length - 1) {
        imageScrollViewRef.current?.scrollToEnd({animated: true});
      } else {
        const scrollPosition = Math.max(0, (index - 1) * (100 + 8));
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

  const handleSave = async () => {
    if (route.params.id) {
      await updateDiary(route.params.id, {
        title: tempTitle,
        content: tempContent,
        emotion: tempEmotion,
        images: tempImages,
      });
    } else {
      await addDiary({
        date: route.params.date!,
        title: tempTitle,
        content: tempContent,
        emotion: tempEmotion,
        images: tempImages,
      });
    }

    setTitle(tempTitle);
    setContent(tempContent);
    setEmotion(tempEmotion);
    setImages(tempImages);
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

  const date = route.params.date ? new Date(route.params.date) : new Date();

  return (
    <AppScreen>
      <ModeHeader
        title={`${formatKoreanDate(date)} ${getKoreanDay(date)}`}
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
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.content}>{content}</Text>
          </>
        ) : (
          <>
            <TextInput
              style={[styles.title, styles.titleInput]}
              value={tempTitle}
              onChangeText={setTempTitle}
              placeholder="제목을 입력하세요"
              placeholderTextColor="rgba(0, 0, 0, 0.3)"
            />
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
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
    padding: 0,
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
