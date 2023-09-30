import { removeUserSession, storeUserSession } from "../../features/user"
import Constants from "expo-constants";

const ipAddress = Constants.manifest.debuggerHost.split(':').shift();
const port = 8080
export const login = async (acc) => {
  try {
    await fetch(`http://${ipAddress}:8000/v1/auth/login`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(acc)
    }).then((res) => res.json()).then((data) => {
      console.log(data)
      if (data !== "Wrong password!")
        storeUserSession(data)
      return data
    })
  }
  catch (err) {
    console.log(err + " req")
    return
  }

}

export const register = async (acc) => {
  try {
    await fetch(`http://${ipAddress}:8050/v1/auth/register`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(acc)
    }).then((res) => res.json()).then((data) => {
      return () => data
    })
  }
  catch (err) {
    console.log(err + " req")
  }
}
export const logout = () => {
  removeUserSession()
}