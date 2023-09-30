import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Background from '../components/Background'
import Logo from '../components/Logo'
import Header from '../components/Header'
import Paragraph from '../components/Paragraph'
import Button from '../components/Button'
import { retrieveStateSession, storeStateSession } from '../storage/user';

export default function Options({ navigation }) {
  const [state, setState] = useState("active")
  const getState = async () => {
    const st = await retrieveStateSession()
    if (st === "active" || st === "busy")
      setState(st)
  }
  useEffect(() => {

    getState()
    console.log(state)
  }, [])
  return (
    <Background>
      {/* <Logo /> */}
      <Header>Welcome to Taxi App</Header>
      <Paragraph>
      </Paragraph>
      {state === "active" &&
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Map')}
        >
          Map
        </Button>
      }
      {state === "busy" &&
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Map')}
          disabled
        >
          Map
        </Button>
      }
      <Button
        mode="contained"
        onPress={() => navigation.navigate('Profile')}
      >
        Profile
      </Button>
      <Button
        mode="outlined"
        onPress={() =>
          navigation.reset({
            index: 0,
            routes: [{ name: 'StartScreen' }],
          })
        }
      >
        Logout
      </Button>
      <View style={styles.state}>
        {state === "active" &&
          <Button
            mode="contained"
            onPress={() => {
              setState("busy")
              storeStateSession("busy")
            }}
          >
            Active
          </Button>
        }
        {state === "busy" &&
          <Button
            mode="outlined"
            onPress={() => {
              setState("active")
              storeStateSession("active")
            }}
          >
            Busy
          </Button>
        }

      </View>
    </Background>
  )
}

const styles = StyleSheet.create({
  state: {
    position: "absolute",
    bottom: 50

  }
})