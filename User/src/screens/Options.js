import React from 'react'
import Background from '../components/Background'
import Logo from '../components/Logo'
import Header from '../components/Header'
import Paragraph from '../components/Paragraph'
import Button from '../components/Button'
import { logout } from '../api/login'

export default function Options({ navigation }) {
  return (
    <Background>
      <Logo />
      <Header>Welcome to Taxi App</Header>
      <Paragraph>
      </Paragraph>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('Map')}
      >
        Map
      </Button>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('Profile')}
      >
        Profile
      </Button>
      <Button
        mode="outlined"
        onPress={() => {
          logout()
          navigation.reset({
            index: 0,
            routes: [{ name: 'StartScreen' }],
          })
        }
        }
      >
        Logout
      </Button>
    </Background>
  )
}
