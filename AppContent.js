import React, { useEffect, useState } from 'react';
import { View, Button, Text, FlatList, Image, TouchableOpacity, Modal, ScrollView, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { addFavorite, removeFavorite, setFavorites } from './redux/favoritesSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const AppContent = () => {
    const dispatch = useDispatch();
    const favorites = useSelector(state => state.favorites.favorites);

    const [isModalVisible, setModalVisible] = useState(false);
    const [currentVideo, setCurrentVideo] = useState(null);
    const [recording, setRecording] = useState(false);
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);
    const [recordSecs, setRecordSecs] = useState(0);
    const [recordTime, setRecordTime] = useState('00:00');
    const [playTime, setPlayTime] = useState('00:00');
    const [duration, setDuration] = useState('00:00');

    const audioRecorderPlayer = new AudioRecorderPlayer();

    useEffect(() => {
        const loadFavorites = async () => {
            const savedFavorites = await AsyncStorage.getItem('favorites');
            if (savedFavorites) {
                dispatch(setFavorites(JSON.parse(savedFavorites)));
            }
        };
        loadFavorites();
    }, [dispatch]);

    const mockVideos = [

        {
            id: 'def456',
            title: 'Morning Song',
            singer: 'Lata Mangeshkar',
            thumbnailUrl: require('./assets/images/img2.jpg'),
            videoUrl: require('./assets/audioMusic.mp4'),
        },
        {
            id: 'ghi789',
            title: 'night song',
            singer: 'Beginner Yoga',
            thumbnailUrl: require('./assets/images/Img3.jpg'),
            videoUrl: require('./assets/audioMusic.mp4'),
        },
        {
            id: 'ghi745',
            title: 'Sad song',
            singer: 'Beginner Yoga',
            thumbnailUrl: require('./assets/images/Img4.jpg'),
            videoUrl: require('./assets/audioMusic.mp4'),
        },
        {
            id: 'ghi795',
            title: 'Happy Song',
            singer: 'Shreya Ghoshal',
            thumbnailUrl: require('./assets/images/Img5.jpg'),
            videoUrl: require('./assets/audioMusic.mp4'),
        },

    ];

    const onStartRecord = async () => {
        try {
            const result = await audioRecorderPlayer.startRecorder();
            audioRecorderPlayer.addRecordBackListener((e) => {
                setRecordSecs(e.currentPosition);
                setRecordTime(audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)));
                return;
            });
            setRecording(true);
            console.log('Recording started:', result);
        } catch (error) {
            console.error('Error starting recording:', error);
        }
    };

    const onStopRecord = async () => {
        try {
            const result = await audioRecorderPlayer.stopRecorder();
            audioRecorderPlayer.removeRecordBackListener();
            setRecording(false);
            setRecordSecs(0);
            console.log('Recording stopped:', result);
        } catch (error) {
            console.error('Error stopping recording:', error);
        }
    };

    const onStartPlay = async () => {
        console.log('Playing audio...');
        const msg = await audioRecorderPlayer.startPlayer();
        audioRecorderPlayer.addPlayBackListener((e) => {
            setPlayTime(audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)));
            setDuration(audioRecorderPlayer.mmssss(Math.floor(e.duration)));
            return;
        });
        setIsPlayingAudio(true);
        console.log('Audio started:', msg);
    };

    const onStopPlay = async () => {
        console.log('Stopping playback...');
        audioRecorderPlayer.stopPlayer();
        audioRecorderPlayer.removePlayBackListener();
        setIsPlayingAudio(false);
    };



    const handleThumbnailPress = (video) => {
        setCurrentVideo(video.videoUrl);
        setModalVisible(true);
    };

    const handleFavoriteToggle = (video) => {
        favorites.some(item => item.id === video.id)
            ? dispatch(removeFavorite(video.id))
            : dispatch(addFavorite(video));
    };


    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <ScrollView contentContainerStyle={{ padding: 20 }}>
                <Text style={styles.heading}>Mock Videos:</Text>
                <FlatList
                    data={mockVideos}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => {
                        const isFavorite = favorites.some(fav => fav.id === item.id); // Move isFavorite outside JSX
                        return (
                            <TouchableOpacity onPress={() => handleThumbnailPress(item)}>
                                <View style={styles.videoItem}>
                                    <Image source={item.thumbnailUrl} style={styles.thumbnail} />
                                    <View>
                                        <Text style={styles.title}>{item.title}</Text>
                                        <Text style={styles.artist}>{item.singer}</Text>
                                        <Icon name={isFavorite ? 'cards-heart' : 'heart-outline'} size={30} color={isFavorite ? 'red' : 'gray'} onPress={() => handleFavoriteToggle(item)} />

                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    }}
                    initialNumToRender={5}
                    scrollEnabled={false}
                />

                <Text style={styles.heading}>Favorites List:</Text>
                <FlatList
                    data={favorites}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.videoItem}>
                            <TouchableOpacity onPress={() => handleThumbnailPress(item)}>
                                <Image source={item.thumbnailUrl} style={styles.thumbnail} />
                            </TouchableOpacity>
                            <View>
                                <Text style={styles.title}>{item.title}</Text>
                                <Text style={styles.artist}>by {item.artist}</Text>
                            </View>
                        </View>
                    )}
                    initialNumToRender={5}
                    scrollEnabled={false}
                />

                <Modal visible={isModalVisible} transparent={true} animationType="slide">
                    <View style={styles.modal}>
                        {currentVideo && (
                            <Video
                                source={currentVideo}
                                style={styles.videoPlayer}
                                controls={true}
                                resizeMode="contain"
                            />
                        )}

                        <TouchableOpacity style={styles.backButton} onPress={() => setModalVisible(false)}>
                            <Icon name="arrow-left" size={24} color="#fff" style={styles.icon} />
                            <Text style={styles.buttonText}>Back</Text>
                        </TouchableOpacity>

                        <View style={{ padding: 10, gap: 10 }}>
                            <TouchableOpacity style={styles.recordButton} onPress={recording ? onStopRecord : onStartRecord}>
                                <Icon name={recording ? 'microphone-off' : 'microphone'} size={30} color="white" />
                                <Text style={styles.buttonText}>{recording ? 'Stop Recording' : 'Start Recording'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.playButton} onPress={isPlayingAudio ? onStopPlay : onStartPlay}>
                                <Icon name={isPlayingAudio ? 'pause' : 'play'} size={30} color="white" />
                                <Text style={styles.buttonText}>{isPlayingAudio ? 'Pause' : 'Play'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        </View>
    );

};

const styles = StyleSheet.create({
    heading: {
        marginTop: 20,
        fontWeight: 'bold',
        fontSize: 18,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'red',
        padding: 10,
        borderRadius: 20,
        width: '50%',
        justifyContent: 'center',
        backgroundColor: '#87CEEB'
    },
    videoItem: {
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    thumbnail: {
        width: 100,
        height: 100,
        marginRight: 10,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    artist: {
        fontSize: 14,
        color: 'gray',
    },
    modal: {
        flex: 1,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoPlayer: {
        width: '90%',
        height: 300,
    },
    recordButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'red',
        padding: 8,
        borderRadius: 20,
        justifyContent: 'center'
    },
    playButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'blue',
        padding: 10,
        borderRadius: 50,
        justifyContent: 'center'
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        marginLeft: 10,
    },
});

export default AppContent;
