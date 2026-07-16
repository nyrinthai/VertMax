import * as MediaLibrary from 'expo-media-library';
import { useEffect, useState } from 'react';
import { Alert, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


export default function Gallery() {
    const [albums, setAlbums] = useState<MediaLibrary.Album[]>([]);
    const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();

    async function getAlbums() {
        if (!permissionResponse) return;

        if (permissionResponse.status === 'granted') {

            const fetchedAlbums = await MediaLibrary.getAlbumsAsync({
                includeSmartAlbums: true,
            });
            setAlbums(fetchedAlbums);
            return;
        }
        const result = await requestPermission();

            if (result.status === 'granted') {
                const fetchedAlbums = await MediaLibrary.getAlbumsAsync({
                    includeSmartAlbums: true,
                });
                setAlbums(fetchedAlbums);
            } else if (result.status === 'denied'){
                Alert.alert(
                    'Permission to access media library is required!',
                    'To use this feature, got to Settings > VertTracker > Photos and select Allow.',
                    [
                        { text: 'Cancel', style: 'cancel' , onPress: () => {}},
                        { text: 'Open Settings', style: 'default', onPress: () => Linking.openSettings() },
                    ]
                );
            }
        }

  return (
    <View style={styles.container}>

                <TouchableOpacity style={styles.button} onPress={getAlbums}>
                    <Text style={styles.buttonText}>Load Albums</Text>
                </TouchableOpacity>
                <ScrollView>
                    {albums && albums.map((album) => (
                        <AlbumEntry key={album.id} album={album} />
                    ))}
                </ScrollView>
    </View>
  );

}

function AlbumEntry({ album } : { album: MediaLibrary.Album }) {
  const [assets, setAssets] = useState<MediaLibrary.Asset[]>([]);

  useEffect(() => {
    async function getAlbumAssets() {
      const albumAssets = await MediaLibrary.getAssetsAsync({ album });
      setAssets(albumAssets.assets);
    }
    getAlbumAssets();
  }, [album]);


  return (
    <View key={album.id} style={styles.albumContainer}>
      <Text>
        {album.title} - {album.assetCount ?? 'no'} assets
      </Text>
      <View style={styles.albumAssetsContainer}>
        {assets && assets.map((asset) => (
          <Image key={asset.id} source={{ uri: asset.uri }} style = {{width: 50, height: 50 }}/>
        ))}
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        padding : 20,
        paddingTop : 75,
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 18,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#007AFF',
        marginTop: 20,
        marginBottom: 20,
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    image: {
        width: 300,
        height: 300,
        marginTop: 20,
        marginBottom: 20,
        borderRadius: 10,
    },
    albumContainer: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 10,
    },
    albumAssetsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 10,
    },
})