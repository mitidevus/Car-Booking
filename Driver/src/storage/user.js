
import jwtDecode from "jwt-decode";
import AsyncStorage from '@react-native-async-storage/async-storage';

export const decodeToken = (token) => {
    const decodedToken = jwtDecode(token);
    const expirationTime = decodedToken.exp * 1000; // Tính theo miliseconds
    const currentTime = Date.now();
    return expirationTime - currentTime;
};

export async function storeUserSession(user) {
    try {
        await AsyncStorage.setItem(
            "user",
            JSON.stringify(user)
        );

    } catch (error) {
        console.log(error)
    }
}
export async function storeStateSession(state) {
    try {
        await AsyncStorage.setItem(
            "state",
            state
        );

    } catch (error) {
        console.log(error)
    }
}
export const retrieveStateSession = async () => {
    try {
        const session = await AsyncStorage.getItem("state");
        if (session !== undefined && session !== null) {
            return session
        }

        return "active"
    } catch (error) {
        console.log(error)
        return "active"
    }
}

export const retrieveUserSession = async () => {
    try {
        const session = await AsyncStorage.getItem("user");
        console.log(JSON.parse(session))
        if (session !== undefined && session !== null) {
            return JSON.parse(session)
        }

        return null
    } catch (error) {
        console.log(error)
    }
}

export async function removeUserSession() {
    try {
        await AsyncStorage.removeItem("user");
    } catch (error) {
        console.log(error)
    }
}