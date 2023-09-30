import React, { useState, useEffect } from 'react'
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { Text } from 'react-native-paper'
import Background from '../components/Background'
import Logo from '../components/Logo'
import Header from '../components/Header'
import Button from '../components/Button'
import TextInput from '../components/TextInput'
import NameInput from '../components/NameInput'
import BackButton from '../components/BackButton'
import { theme } from '../core/theme'
import { emailValidator } from '../helpers/emailValidator'
import { passwordValidator } from '../helpers/passwordValidator'
import { nameValidator } from '../helpers/nameValidator'
import { register } from '../api/login'
import { phoneValidator } from '../helpers/phoneValidator'
import DropDownPicker from 'react-native-dropdown-picker';
import Constants from "expo-constants";
// import { signup } from "../features/userSlice";
// import { useDispatch } from "react-redux";

export default function RegisterScreen({ navigation }) {
  const [firstName, setFirstName] = useState({ value: '', error: '' })
  const [lastName, setLastName] = useState({ value: '', error: '' })
  const [email, setEmail] = useState({ value: '', error: '' })
  const [password, setPassword] = useState({ value: '', error: '' })
  const [phone, setPhone] = useState({ value: '', error: '' })
  const [open, setOpen] = useState(false);
  const [gender, setGender] = useState(null)
  const [genderList, setGenderList] = useState([])
  const [nextPage, setNextPage] = useState(false)

  const [vehiclePlate, setVehiclePlate] = useState({ value: '', error: '' })
  const [vehicleType, setVehicleType] = useState({ value: '', error: '' })
  const [driverType, setDriverType] = useState([])
  const [driver, setDriver] = useState(null)
  const [openDriverType, setOpenDriverType] = useState(false)
  const [numberSeat, setNumberSeat] = useState([])
  const [seat, setSeat] = useState(null)
  const [openNumberSeat, setOpenNumberSeat] = useState(false)

  const ipAddress = Constants.manifest.debuggerHost.split(':').shift();
  useEffect(() => {
    setGenderList([
      { label: 'female', value: 'female' },
      { label: 'male', value: 'male' },
      { label: 'other', value: 'other' }
    ])
    setDriverType([
      { label: 'Standard', value: 'Standard' },
      { label: 'Plus', value: 'Plus' }
    ])
    setNumberSeat([
      { label: '4', value: '4' },
      { label: '7', value: '7' }
    ])
  }, [])
  const onNextPressed = () => {
    const fNameError = nameValidator(firstName.value)
    const lNameError = nameValidator(lastName.value)
    const emailError = emailValidator(email.value)
    const passwordError = passwordValidator(password.value)
    const phoneError = phoneValidator(phone.value)

    if (emailError || passwordError || lNameError || fNameError || phoneError) {
      setFirstName({ ...firstName, error: fNameError })
      setLastName({ ...lastName, error: lNameError })
      setEmail({ ...email, error: emailError })
      setPassword({ ...password, error: passwordError })
      setPhone({ ...phone, error: phoneError })
      return
    }

    setNextPage(true)
  }

  const onSignUpPressed = async () => {
    const vehiclePlateError = nameValidator(vehiclePlate.value)
    const vehicleTypeError = nameValidator(vehicleType.value)



    if (vehiclePlateError || vehicleTypeError ) {
      setVehiclePlate({ ...vehiclePlate, error: vehiclePlateError })
      setVehicleType({ ...vehicleType, error: vehicleTypeError })
      return
    }

    const acc = {
      "email": email.value,
      "password": password.value,
      "firstName": firstName.value,
      "lastName": lastName.value,
      "phone": phone.value.toString(),
      "gender": gender,
      "role": "driver",
      "vehiclePlate": vehiclePlate.value,
      "vehicleType": vehicleType.value,
      "driverType": driver,
      "numberSeat": seat
    }
    console.log("acc ", acc)
    try {
      await fetch(`http://${ipAddress}:8050/v1/auth/register`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(acc)
      }).then((res) => res.json()).then((data) => {
        console.log(typeof data)
        if (typeof data === 'string' || data instanceof String) {
          alert("Error")
          return
        }
        else {
          navigation.navigate('LoginScreen')
        }
      })
    }
    catch (err) {
      console.log(err + " req")
      return
    }

  }

  return (
    <Background>
      <BackButton goBack={navigation.goBack} />
      <Logo />
      <Header>Create Account</Header>
      {!nextPage &&
        <>
          <View style={styles.name}>
            <NameInput
              label="First Name"
              returnKeyType="next"
              value={firstName.value}
              onChangeText={(text) => setFirstName({ value: text, error: '' })}
              error={!!firstName.error}
              errorText={firstName.error}
            />
            <NameInput
              label="Last Name"
              returnKeyType="next"
              value={lastName.value}
              onChangeText={(text) => setLastName({ value: text, error: '' })}
              error={!!lastName.error}
              errorText={lastName.error}
            />
          </View>

          <TextInput
            label="Email"
            returnKeyType="next"
            value={email.value}
            onChangeText={(text) => setEmail({ value: text, error: '' })}
            error={!!email.error}
            errorText={email.error}
            autoCapitalize="none"
            autoCompleteType="email"
            textContentType="emailAddress"
            keyboardType="email-address"
          />
          <TextInput
            label="Password"
            returnKeyType="done"
            value={password.value}
            onChangeText={(text) => setPassword({ value: text, error: '' })}
            error={!!password.error}
            errorText={password.error}
            secureTextEntry
          />
          <TextInput
            label="Phone number"
            returnKeyType="next"
            value={phone.value}
            onChangeText={(text) => setPhone({ value: text, error: '' })}
            error={!!phone.error}
            errorText={phone.error}
            keyboardType="phone-pad"
          />
          {genderList &&
            <DropDownPicker
              placeholder='Gender'
              open={open}
              value={gender}
              items={genderList}
              setOpen={setOpen}
              setValue={setGender}
              setItems={setGenderList}
              zIndex={5000}
              style={styles.gender}
            />
          }
          <Button
            mode="contained"
            onPress={onNextPressed}
            style={{ marginTop: 24 }}
          >
            Next
          </Button>
        </>
      }
      {nextPage &&
        <>

          <TextInput
            label="Vehicle Plate"
            returnKeyType="next"
            value={vehiclePlate.value}
            onChangeText={(text) => setVehiclePlate({ value: text, error: '' })}
            error={!!vehiclePlate.error}
            errorText={vehiclePlate.error}
          />
          <TextInput
            label="Vehicle Type"
            returnKeyType="next"
            value={vehicleType.value}
            onChangeText={(text) => setVehicleType({ value: text, error: '' })}
            error={!!vehicleType.error}
            errorText={vehicleType.error}
          />
          {driverType && numberSeat &&
            <>
              <DropDownPicker
                placeholder='Driver Type'
                open={openDriverType}
                value={driver}
                items={driverType}
                setOpen={setOpenDriverType}
                setValue={setDriver}
                setItems={setDriverType}
                zIndex={5000}
                style={styles.gender}

              />
              <DropDownPicker
                placeholder='Number of seats'
                open={openNumberSeat}
                value={seat}
                items={numberSeat}
                setOpen={setOpenNumberSeat}
                setValue={setSeat}
                setItems={setNumberSeat}
                zIndex={5000}
                style={styles.gender}
              />
            </>
          }
          <Button
            mode="contained"
            onPress={() => setNextPage(false)}
            style={{ marginTop: 24 }}
          >
            Previous
          </Button>
          <Button
            mode="contained"
            onPress={onSignUpPressed}
            style={{ marginTop: 24 }}
          >
            Sign up
          </Button>
        </>
      }
      <View style={styles.row}>
        <Text>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.replace('LoginScreen')}>
          <Text style={styles.link}>Login</Text>
        </TouchableOpacity>
      </View>
    </Background>
  )
}

const styles = StyleSheet.create({
  name: {
    width: '100%',
    flexDirection: 'row',
    marginTop: 4,
    justifyContent: 'space-between',

  },
  row: {
    flexDirection: 'row',
    marginTop: 4,

  },
  gender: {
    marginTop: 20,
    zIndex: 1
  },
  link: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
})
