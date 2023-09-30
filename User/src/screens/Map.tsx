import React, { useEffect, useState, useRef } from 'react';
import MapView, { LatLng, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import DropDownPicker from 'react-native-dropdown-picker';
import {
  Dimensions,
  Platform,
  Text,
  View,
  StyleSheet,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Pressable,
  TouchableOpacity,
  NativeModules
} from 'react-native';
import { Image } from 'react-native-elements';
import * as Location from 'expo-location';
import BackButton from '../components/BackButton'
import MapViewDirections from "react-native-maps-directions";
import { theme } from '../core/theme'
import Button from '../components/Button'
import { GOOGLE_API_KEY } from '../../env';
import Constants from "expo-constants";
import {
  GooglePlaceDetail,
  GooglePlacesAutocomplete,
} from "react-native-google-places-autocomplete";
import InputAutocomplete from '../components/InputAutoComplete';
import { retrieveUserSession } from '../features/user';
import AsyncStorage from '@react-native-async-storage/async-storage';

// type InputAutocompleteProps = {
//   label: string;
//   placeholder?: string;
//   onPlaceSelected: (details: GooglePlaceDetail | null) => void;
// };

// function InputAutocomplete({
//   label,
//   placeholder,
//   onPlaceSelected,
// }: InputAutocompleteProps) {
//   return (
//     <>
//       <Text>{label}</Text>
//       <GooglePlacesAutocomplete
//         styles={{ textInput: styles.pickingAdr }}
//         placeholder={placeholder || ""}
//         fetchDetails
//         onPress={(data, details) => {
//           onPlaceSelected(details);
//         }}
//         query={{
//           key: GOOGLE_API_KEY,
//           language: "pt-BR",
//         }}
//       />
//     </>
//   );
// }
export default function Map({ navigation }) {



  const [origin, setOrigin] = useState<LatLng | null>();
  const [destination, setDestination] = useState<LatLng | null>();
  const [showDirections, setShowDirections] = useState(false);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [price, setPrice] = useState(null);
  const [locationStart, setLocationStart] = useState("")
  const [locationEnd, setLocationEnd] = useState("")
  const [isBooking, setIsBooking] = useState(false)
  const [tripInfo, setTripInfo] = useState({})
  const [res, setRes] = useState(null)

  const mapRef = useRef<MapView>(null);
  // var ws = useRef(null);
  // var ws = new WebSocket('ws://127.0.0.1:8086');
  // const [serverState, setServerState] = React.useState('Loading...');
  // const [disableButton, setDisableButton] = React.useState(true);
  // const [inputFieldEmpty, setInputFieldEmpty] = React.useState(true);
  // const [serverMessages, setServerMessages] = React.useState([]);

  const [driverInfo, setDriverInfo] = useState(null)
  const [driverLocation, setDriverLocation] = useState<LatLng | null>()

  const [user, setUser] = useState({})

  const getUser = async () => {
    try {
      const session = await AsyncStorage.getItem("user");
      
      if (session !== undefined && session !== null) {
        setUser(JSON.parse(session))
        return JSON.parse(session)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const moveTo = async (position: LatLng) => {
    const camera = await mapRef.current?.getCamera();
    if (camera) {
      camera.center = position;
      mapRef.current?.animateCamera(camera, { duration: 1000 });
    }
  };


  const [ws, setWs] = useState(null)
  const ipAddress = Constants.manifest.debuggerHost.split(':').shift();
  const port = 8086
  useEffect(() => {
    getUser().then(u => {
      console.log("u ", u)
      if (u) {
        const socketUrl = `ws://${ipAddress}:${port}/v1/user/booking`
        const socket = new WebSocket(socketUrl, [], {
          headers: {
            Authorization: "Bearer " + u["accessToken"]
          }
        })
        socket.onopen = () => {

          console.log("Connected")
          setWs(socket)

        };

        socket.onmessage = (e) => {

          const data = JSON.parse(e.data)
          console.log(data)
          if (data.type === "tracking_location") {
            setDriverInfo(() => data.payload)
            setDriverLocation(() => ({
              latitude: data.payload["latitude"],
              longitude: data.payload["longitude"]
            }))
          }
          else if (data.type === "trip_info") {
            setTripInfo(() => data.payload)
            setDistance(0)
            setDuration(0)
            setPrice(0)
          }
          else if (data.type === "on_trip") {
            alert("Start trip")
          }
          else if (data.type === "trip_completed") {
            alert("Thank you for choosing our App")
            setOrigin(null)
            setDestination(null)
            setIsBooking(false)
            setTripInfo({})
            setDistance(0)
            setDuration(0)
            setPrice(0)
          }
        };
        socket.onerror = (e) => {
          console.log("Error: ")
          console.log(e)
        };
        socket.onclose = () => {
          console.log('WebSocket connection closed');

        };

        return () => {
          console.log("Close")
          socket.close()
        };



      };
    })





  }, [])

  const edgePaddingValue = 70;

  const edgePadding = {
    top: edgePaddingValue,
    right: edgePaddingValue,
    bottom: edgePaddingValue,
    left: edgePaddingValue,
  };
  function TraceDriver() {
    return (
      <>
        {driverLocation && <Marker
          coordinate={driverLocation}
        >
          <Image
            source={require('../assets/car_icon.png')}
            style={styles.markerImage}
          />
        </Marker>}
        {origin && <Marker coordinate={origin} pinColor={"blue"} />}
        {showDirections && origin && driverLocation && (
          <MapViewDirections
            origin={driverLocation}
            destination={origin}
            apikey={GOOGLE_API_KEY}
            strokeColor="#f1c40f"
            strokeWidth={4}
          />
        )
        }
      </>
    )
  }

  const traceRouteOnReady = async (args: any) => {
    if (args) {
      // args.distance
      // args.duration
      setDistance(args.distance);
      setDuration(args.duration);
      let previewBooking = {
        "longitudeFrom": origin.longitude.toString(),
        "latitudeFrom": origin.latitude.toString(),
        "addressFrom": locationStart,
        "longitudeTo": destination.longitude.toString(),
        "latitudeTo": destination.latitude.toString(),
        "addressTo": locationEnd,
        "distance": args.distance
      }
      console.log("Booking")
      console.log(previewBooking)
      try {
        await fetch(`http://${ipAddress}:8086/v1/user/preview-booking`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + user["accessToken"],
          },
          body: JSON.stringify(previewBooking)
        }).then((res) => res.json()).then((data) => {
          console.log(data)
          setPrice(data.data.previewBooking)
          setItems(getPrice(data.data.previewBooking))
        })
      }
      catch (err) {
        console.log(err + " req")
      }
    }
  };

  const traceRoute = () => {
    if (origin && destination) {
      setShowDirections(true);
      mapRef.current?.fitToCoordinates([origin, destination], { edgePadding });
    }

  };
  const onPlaceSelected = (
    details: GooglePlaceDetail | null,
    flag: "origin" | "destination"
  ) => {
    const set = flag === "origin" ? setOrigin : setDestination;
    const setLocation = flag === "origin" ? setLocationStart : setLocationEnd;
    const position = {
      latitude: details?.geometry.location.lat || 0,
      longitude: details?.geometry.location.lng || 0,
    }; moveTo
    set(position);
    moveTo(position);
    let location = ""
    for (let i = 0; i < details.address_components.length; i++) {
      location += details.address_components[i].long_name
      if (i != details.address_components.length - 1)
        location += ", "
    }
    setLocation(location)
  };

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState(null);
  function getPrice(p) {
    let data = []
    console.log(p)
    let i = 0
    p.map((x, idx) => {
      let cost = "Price: " + x.price.toString() + " Car type: " + x.serviceCode;
      let option = "{\"price\": " + x.price.toString() + ", \"serviceCode\": \"" + x.serviceCode + "\"}";
      const obj = {
        label: cost,
        value: option
      }
      data.push(obj)
      i += 1
    });
    return data
  }
  function booking() {
    const data = {
      "type": "booking",
      "payload": {
        "userId": "612345678901234567890123",
        "longitudeFrom": origin.longitude.toString(),
        "latitudeFrom": origin.latitude.toString(),
        "addressFrom": locationStart,
        "longitudeTo": destination.longitude.toString(),
        "latitudeTo": destination.latitude.toString(),
        "addressTo": locationEnd,
        "serviceCode": JSON.parse(value).serviceCode, //ServiceType (Standard, Plus) - NumSeat
        "price": JSON.parse(value).price
      }
    }
    // const data = {
    //   "type": "booking",
    //   "payload": {
    //     "userId": "612345678901234567890123",
    //     "longitudeFrom": "123.456789",
    //     "latitudeFrom": "45.678901",
    //     "addressFrom": "123 Main St, City",
    //     "longitudeTo": "234.567890",
    //     "latitudeTo": "56.789012",
    //     "addressTo": "456 Elm St, City",
    //     "serviceCode": "Standard-4",
    //     "price": 299.9999
    //   }
    // }
    console.log("booking success")
    console.log(data)
    ws.send(JSON.stringify(data))
    setIsBooking(true)
    alert("Booking success")
  }
  function cancelBooking() {
    const data = JSON.stringify({
      "type": "cancel_booking",
      "payload": {
        "customerId": "612345678901234567890123"
      }
    })
    ws.send(data)
    setIsBooking(false)
  }
  function cancelTrip() {
    const data = JSON.stringify({
      "type": "cancel_trip",
      "payload": {
        "tripId": tripInfo["_id"],
        "driverId": "612345678901234567890123",
        "customerId": "612345678901234567890123",
        "reason": "Driver unavailable"
      }
    })
    ws.send(data)
    setIsBooking(false)
  }
  //__________________________________________________________________

  return (
    <SafeAreaView style={styles.container} >
      <MapView
        style={styles.map}
        ref={mapRef}
        initialRegion={{
          latitude: 13.406,
          longitude: 123.3753,
          latitudeDelta: 0.005,
          longitudeDelta: 0.0005,
        }
        }
        provider={PROVIDER_GOOGLE}
        // showsUserLocation={true}
        // onUserLocationChange={(e) => {
        //   getUser()
        //   getToken()
        // }}
      >
        {origin && <Marker coordinate={origin} pinColor={'blue'} />}
        {destination && <Marker coordinate={destination} pinColor={'red'} />}
        {showDirections && origin && destination && (
          <MapViewDirections
            origin={origin}
            destination={destination}
            apikey={GOOGLE_API_KEY}
            strokeColor="#6644ff"
            strokeWidth={4}
            onReady={traceRouteOnReady}
          />
        )}
        <TraceDriver />
      </MapView>

      <View style={styles.search}>
        <InputAutocomplete
          label="Start"
          onPlaceSelected={(details) => {
            onPlaceSelected(details, "origin");
          }}
        />
        <InputAutocomplete
          label="Destination"
          onPlaceSelected={(details) => {
            onPlaceSelected(details, "destination");
          }}
        />

        <TouchableOpacity style={styles.button} onPress={traceRoute}>
          <Text style={styles.buttonText}>Trace route</Text>
        </TouchableOpacity>

        {distance && duration ? (
          <View>
            <Text>Distance: {distance.toFixed(2)} km</Text>
            <Text>Duration: {Math.ceil(duration)} min</Text>
            {value &&
              <TouchableOpacity style={styles.button} onPress={booking}>
                <Text style={styles.buttonText}>Booking</Text>
              </TouchableOpacity>
            }
            {price && items &&
              <DropDownPicker
                open={open}
                value={value}
                items={items}
                setOpen={setOpen}
                setValue={setValue}
                setItems={setItems}
                zIndex={5000}
              />
            }
          </View>
        ) : null}
      </View>
      {isBooking && Object.keys(tripInfo).length === 0 &&
        <View style={styles.cancelBooking}>
          <TouchableOpacity style={styles.button} onPress={cancelBooking}>
            <Text style={styles.buttonText}>Cancel booking</Text>
          </TouchableOpacity>
        </View>
      }
      {isBooking && tripInfo && Object.keys(tripInfo).length > 0 &&
        <View style={styles.cancelBooking}>
          <TouchableOpacity style={styles.button} onPress={cancelTrip}>
            <Text style={styles.buttonText}>Cancle trip</Text>
          </TouchableOpacity>
        </View>
      }
      <BackButton goBack={navigation.goBack} />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickingAdr: {
    borderRadius: 5,
    borderColor: "black",
    borderWidth: 0.25,
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  markerImage: {
    width: 35,
    height: 35
  },
  backButton: {
    position: "absolute",
    top: 0,
    left: 10,
  },

  search: {
    position: "absolute",
    width: "95%",
    top: 70,
    backgroundColor: 'white',
    shadowColor: "#000",
    borderRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
    padding: 10,
    paddingTop: 20,
    //paddingBottom: 30,

  },
  cancelBooking: {
    width: "95%",
    bottom: 70,
    backgroundColor: 'white',
    shadowColor: "#000",
    borderRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
    padding: 10,
    paddingTop: 20,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 10,
    textAlign: "center",
  },
  buttonText: {
    textAlign: "center",
    color: "white"
  },
});