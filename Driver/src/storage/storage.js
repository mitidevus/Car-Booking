import AsyncStorage from '@react-native-async-storage/async-storage';

export async function storeSession(storage, data) {
    try {
        await AsyncStorage.setItem(
            `${storage}`,
            JSON.stringify(data)
        );

    } catch (error) {
        console.log(error)
    }
}

export const getSession = async (storageName) => {
    try {
        const session = await AsyncStorage.getItem(`${storageName}`);
        console.log(`${storageName}`)
        if (session !== undefined && session !== null) {
            return JSON.parse(session)
        }

        return null
    } catch (error) {
        console.log(error)
    }
}

export async function removeSession(storageName) {
    try {
        await AsyncStorage.removeItem(`${storageName}`);
    } catch (error) {
        console.log(error)
    }
}