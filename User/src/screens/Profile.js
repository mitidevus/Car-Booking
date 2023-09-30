import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, Pressable, Image, StyleSheet } from 'react-native';
import tailwind from 'twrnc';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Background from '../components/Background';
import BackButton from '../components/BackButton'
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function UserProfile({ navigation }) {
    const [user, setUser] = useState({})

    const getUser = async () => {
        try {
            const session = await AsyncStorage.getItem("user");
            console.log(JSON.parse(session))
            if (session !== undefined && session !== null) {
                setUser(JSON.parse(session))
            }
        } catch (error) {
            console.log(error)
        }
    }
    useEffect(() => {
        getUser()
        console.log("user")
        console.log(user)
    }, [])
    return (
        <SafeAreaView style={styles.container}>
            {user &&
                <Background>
                    <View style={tailwind`flex-1 items-center justify-center gap-8`}>
                        <Image
                            source={{ uri: 'https://source.unsplash.com/random' }}
                            style={tailwind`w-24 h-24 rounded-full`}
                            resizeMode="cover"
                        />
                        <View style={tailwind`gap-2 items-center`}>
                            <Text style={tailwind`text-3xl font-bold`}>Tin Tran</Text>
                            <Text style={tailwind`text-slate-900 text-lg`}>{user.email}</Text>
                            <Text style={tailwind`text-slate-900 text-lg`}>{user.phone}</Text>
                        </View>
                    </View>
                    <View style={tailwind`flex-1 justify-center gap-8`}>
                        <Pressable style={tailwind`flex-row items-center gap-2 px-8`}>
                            <Ionicons name="settings-outline" size={24} style={tailwind`text-slate-900`} />
                            <Text style={tailwind`text-slate-900 text-lg`}>Edit</Text>
                        </Pressable>
                        <Pressable style={tailwind`flex-row items-center gap-2 px-8`} onPress={navigation.goBack}>
                            <MaterialIcons name="logout" size={24} style={tailwind`text-slate-900`} />
                            <Text style={tailwind`text-slate-900 text-lg`}>Back</Text>
                        </Pressable>
                        {/* <Pressable style={tailwind`flex-row items-center gap-2 px-8`} onPress={() => console.log(user)}>
                            <MaterialIcons name="logout" size={24} style={tailwind`text-slate-900`} />
                            <Text style={tailwind`text-slate-900 text-lg`}>Back</Text>
                        </Pressable> */}
                    </View>

                </Background>
            }
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})