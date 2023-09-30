import React, { useEffect, useState, useRef } from 'react';
import MapView, { LatLng, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { SwipeListView } from 'react-native-swipe-list-view';
import { Dimensions, Platform, Text, View, StyleSheet, SafeAreaView, TextInput, KeyboardAvoidingView, Pressable, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import BackButton from '../components/BackButton'
import MapViewDirections from "react-native-maps-directions";
import Ionicons from '@expo/vector-icons/Ionicons';
import tailwind from 'twrnc';
import { theme } from '../core/theme'
import Button from '../components/Button'
import { GOOGLE_API_KEY } from '../../env';
import Constants from "expo-constants";
import { location_user } from '../data/location';
import { Image } from 'react-native-elements';
import {
  GooglePlaceDetail,
  GooglePlacesAutocomplete,
} from "react-native-google-places-autocomplete";
import { storeSession, getSession } from '../storage/storage'
import AsyncStorage from '@react-native-async-storage/async-storage';
type InputAutocompleteProps = {
  label: string;
  placeholder?: string;
  onPlaceSelected: (details: GooglePlaceDetail | null) => void;
};

function InputAutocomplete({
  label,
  placeholder,
  onPlaceSelected,
}: InputAutocompleteProps) {
  return (
    <>
      <Text>{label}</Text>
      <GooglePlacesAutocomplete
        styles={{ textInput: styles.pickingAdr }}
        placeholder={placeholder || ""}
        fetchDetails
        onPress={(data, details = null) => {
          onPlaceSelected(details);
        }}
        query={{
          key: GOOGLE_API_KEY,
          language: "en",
        }}
      />
    </>
  );
}



export default function Map({ navigation }) {
  const [driver, setDriver] = useState({
    latitude: 0,
    longitude: 0
  });

  const [origin, setOrigin] = useState<LatLng | null>();
  const [destination, setDestination] = useState<LatLng | null>();
  const [showDirections, setShowDirections] = useState(true);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [price, setPrice] = useState(0);
  const [openListCustomer, setOpenListCustomer] = useState(false);
  const [listCustomer, setListCustomer] = useState([])
  const [customer, setCustomer] = useState({})
  const [tripInfo, setTripInfo] = useState({})
  const [isAcceptTrip, setIsAcceptTrip] = useState(false)
  const [isPickUp, setIsPickUp] = useState(false)
  const [userCancelBooking, setUserCancelBooking] = useState(null)
  const [complete, setComplete] = useState(false)
  // var listCustomer = []
  const [res, setRes] = useState(null)
  const mapRef = useRef<MapView>(null);
  let key = 1
  const ipAddress = Constants.manifest.debuggerHost.split(':').shift();
  const port = 8080
  const socketUrl = `ws://${ipAddress}:${port}/driver`
  //const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0ZmI0NzgwOTBmNThlYjU2NzRjYTBlMiIsInJvbGUiOiJkcml2ZXIiLCJpYXQiOjE2OTQzNDU1ODMsImV4cCI6MTcwOTg5NzU4M30.LloqDksBH0pysxcG9ZKWIfBViVkOoD3q-8xn3ZNoaYM"
  // var ws = useRef(new WebSocket('ws://192.168.1.13:8080/driver')).current;

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


  const [ws, setWs] = useState(null)
  const trackingDriver = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log("can't access location of driver")
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setDriver({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    })
  }
  // useEffect(() => {
  //   trackingDriver()
  // })

  useEffect(() => {
    getUser().then(u => {
      if (u) {
        var socket = new WebSocket(socketUrl, [], {
          headers: {
            Authorization: "Bearer " + u["accessToken"]
          }
        })

        socket.onopen = async () => {

          console.log("Connected")
          const getList = await getSession("listCustomer")
          setListCustomer(getList)
          setWs(socket)

          // Clean up the interval when the WebSocket is closed
        };

        socket.onmessage = (e) => {
          console.log("On message")
          const data = JSON.parse(e.data)
          console.log(data)
          if (data.type === "booking") {
            console.log("set list")
            // var temp = listCustomer
            // data.payload.key = key
            // temp.push(data.payload)
            setListCustomer((prevCustomers) => [...prevCustomers, data.payload])
            key += 1
          }
          else if (data.type === "wait for another trip") {
            alert("Customer has canceled booking")
            setDistance(0)
            setPrice(0)
            setDuration(0)
            setOrigin(null)
            setDestination(null)
            if (customer) {
              console.log("1", customer)
              setListCustomer((list) => list.filter(target => target["userId"] !== customer["userId"]))
              storeSession("listCustomer", listCustomer.filter(target => target["userId"] !== customer["userId"]))
              setCustomer({})
            }
          }
          else if (data.type === "cancel_booking") {
            setDistance(0)
            setPrice(0)
            setDuration(0)
            setOrigin(null)
            setDestination(null)
            if (customer) {
              console.log("2", customer)
              setListCustomer((list) => list.filter(target => target["userId"] !== customer["userId"]))
              storeSession("listCustomer", listCustomer.filter(target => target["userId"] !== customer["userId"]))
              setCustomer({})
            }
          }

          else if (data.status_code === "ACCEPT") {
            setTripInfo(data)
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
        }
      }
    })


  }, [])



  const moveTo = async (position: LatLng) => {
    const camera = await mapRef.current?.getCamera();
    if (camera) {
      camera.center = position;
      mapRef.current?.animateCamera(camera, { duration: 1000 });
    }
  };
  const checkComplete = () => {
    if (driver && destination) {
      const la = Math.abs(driver.latitude - destination.latitude)
      const lo = Math.abs(driver.longitude - destination.longitude)

      if (la < 0.0001 && lo < 0.0001)
        console.log("check")
      setComplete(true)
      return
    }
    setComplete(false)
  }

  const edgePaddingValue = 70;

  const edgePadding = {
    top: edgePaddingValue,
    right: edgePaddingValue,
    bottom: edgePaddingValue,
    left: edgePaddingValue,
  };
//   function distance(lat1,
//     lat2, lon1, lon2)
// {

// // The math module contains a function
// // named toRadians which converts from
// // degrees to radians.
// lon1 =  lon1 * Math.PI / 180;
// lon2 = lon2 * Math.PI / 180;
// lat1 = lat1 * Math.PI / 180;
// lat2 = lat2 * Math.PI / 180;

// // Haversine formula
// let dlon = lon2 - lon1;
// let dlat = lat2 - lat1;
// let a = Math.pow(Math.sin(dlat / 2), 2)}
  function TraceDriver() {
    return (
      <>
        {driver && <Marker
          coordinate={driver}
          draggable={true}
          onDragStart={(e) => {
            setDriver({
              latitude: e.nativeEvent.coordinate.latitude,
              longitude: e.nativeEvent.coordinate.longitude
            })
          }}
          onDragEnd={(e) => {
            setDriver({
              latitude: e.nativeEvent.coordinate.latitude,
              longitude: e.nativeEvent.coordinate.longitude
            })
          }}
        >
          <Image
            source={require('../assets/car_icon.png')}
            style={styles.markerImage}
          />
        </Marker>}
        {origin && <Marker coordinate={origin} />}

        {!isPickUp && showDirections && origin && driver && (
          <MapViewDirections
            origin={driver}
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
  function TraceRoute() {
    if (origin && destination) {
      mapRef.current?.fitToCoordinates([origin, destination], { edgePadding });
    }

    const traceRouteOnReady = (args: any) => {
      if (args) {
        // args.distance
        // args.duration
        setDistance(args.distance);
        setDuration(args.duration);
      }
    };
    return (
      <>
        {origin && <Marker coordinate={origin} />}
        {destination && <Marker coordinate={destination} pinColor={'blue'} />}
        {showDirections && origin && destination && (
          <MapViewDirections
            origin={origin}
            destination={destination}
            apikey={GOOGLE_API_KEY}
            strokeColor="#6644ff"
            strokeWidth={4}
            onReady={traceRouteOnReady}
          />
        )
        }
      </>
    )
  }

  function renderItem(data) {

    return (
      <View
        style={styles.rowFront}>
        <Pressable
          onPress={() => {
            setShowDirections(true)
            console.log(data.item)
            const selected = { ...data.item }
            delete selected.key
            setCustomer(() => selected)
            setIsAcceptTrip(false)
            const start = {
              latitude: parseFloat(data.item.latitudeFrom) || 0,
              longitude: parseFloat(data.item.longitudeFrom) || 0,
            }; moveTo
            const end = {
              latitude: parseFloat(data.item.latitudeTo) || 0,
              longitude: parseFloat(data.item.longitudeTo) || 0,
            }; moveTo
            // const start = {
            //   latitude: data.item.la_start || 0,
            //   longitude: data.item.lng_start || 0,
            // }; moveTo
            // const end = {
            //   latitude: data.item.la_end || 0,
            //   longitude: data.item.lng_end || 0,
            // }; moveTo
            setOrigin(start)
            setDestination(end)
            moveTo(start)
            setPrice(data.item.price)
          }}>
          <Text
          >
            Order: {data.item.price} VND
          </Text>
        </Pressable>
      </View>
    )
  }
  function handleDelete(key: number) {
    // const list = listCustomer.filter(target => target.key !== key)
    setListCustomer((list) => list.filter(target => target.key !== key))
    storeSession("listCustomer", listCustomer.filter(target => target.key !== key))
  }
  function hiddenItem(data) {
    return (
      <View style={styles.rowBack}>
        <TouchableOpacity
          style={[styles.backRightBtn, styles.backRightBtnRight]}
          onPress={() => {
            handleDelete(data.item.key)
            console.log(data.item.userId)
            cancelBooking(data.item.userId)
          }}
        >
          <Text style={styles.backTextWhite}>Close</Text>
        </TouchableOpacity>
      </View>
    )
  }
  function SwipeList({ data }) {
    return (
      <SwipeListView
        data={data}
        renderItem={renderItem}
        renderHiddenItem={hiddenItem}
        rightOpenValue={-75}

        scrollEnabled={true}

      />
    )
  }
  // const traceRouteOnReady = (args: any) => {
  //   if (args) {
  //     // args.distance
  //     // args.duration
  //     setDistance(args.distance);
  //     setDuration(args.duration);
  //     setPrice(args.distance * 5 * 1000);
  //   }
  // };

  // const traceRoute = () => {
  //   if (origin && destination) {
  //     setShowDirections(true);
  //     mapRef.current?.fitToCoordinates([origin, destination], { edgePadding });
  //   }
  // };

  const onPlaceSelected = (
    details: GooglePlaceDetail | null,
    flag: "origin" | "destination"
  ) => {
    const set = flag === "origin" ? setOrigin : setDestination;
    const position = {
      latitude: details?.geometry.location.lat || 0,
      longitude: details?.geometry.location.lng || 0,
    }; moveTo
    set(position);
    moveTo(position);
  };

  const acceptTrip = () => {
    console.log("accept_trip")
    const data = {
      "type": "accept_booking",
      "payload": customer
    }
    ws.send(JSON.stringify(data))
    setIsAcceptTrip(true)
  }
  const cancelBooking = (id: string) => {
    console.log("cancel_booking")
    console.log(id)
    const data = {
      "type": "cancel_booking",
      "payload": {
        "customerId": id
      }
    }
    ws.send(JSON.stringify(data))
  }
  const pickUp = () => {
    console.log("Trip Info", tripInfo)
    const data = {
      "type": "pick_up",
      "payload": {
        "tripId": tripInfo["data"]["_id"],
      }
    }
    ws.send(JSON.stringify(data))
    setIsPickUp(true)

  }
  const tripComplete = () => {
    const data = {
      "type": "drop_off",
      "payload": {
        "tripId": tripInfo["data"]["_id"],
      }
    }
    setListCustomer((list) => list.filter((target) => target.userId !== tripInfo["data"]["userId"]))
    storeSession("listCustomer", listCustomer.filter((target) => target.userId !== tripInfo["data"]["userId"]))
    setTripInfo({})
    setComplete(false)
    setIsAcceptTrip(false)
    setIsPickUp(false)
    setOrigin(null)
    setDestination(null)
    setDistance(0)
    setPrice(0)
    setDuration(0)

    ws.send(JSON.stringify(data))
  }
  return (
    <SafeAreaView style={styles.container} >
      <MapView
        style={styles.map}
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: 13.406,
          longitude: 123.3753,
          latitudeDelta: 0.005,
          longitudeDelta: 0.0005,
        }
        }

        showsUserLocation={true}
        onUserLocationChange={(e) => {
          e.persist()

          if (e && e.nativeEvent && e.nativeEvent.coordinate && e.nativeEvent.coordinate.latitude && e.nativeEvent.coordinate.longitude) {
            const track_driver = {
              "type": "tracking_location",
              "payload": {
                "driverId": user["refId"],
                "longitude": e.nativeEvent.coordinate.longitude,
                "latitude": e.nativeEvent.coordinate.latitude
              }
            }
            if (isAcceptTrip)
              track_driver.payload["userId"] = customer["userId"]
            console.log(track_driver)
            console.log(tripInfo)
            checkComplete()
            if (track_driver && ws) {
              ws.send(JSON.stringify(track_driver))
            }

            setDriver({
              "longitude": e.nativeEvent.coordinate.longitude,
              "latitude": e.nativeEvent.coordinate.latitude
            })

            // setDriver(destination)

          }
        }}
      // onPress={(e) => {
      //   console.log(e.nativeEvent.coordinate)
      //   setDestination({
      //     latitude: e.nativeEvent.coordinate.latitude,
      //     longitude: e.nativeEvent.coordinate.longitude,
      //   })
      // }}
      >
        <TraceRoute />
        <TraceDriver />
      </MapView>

      <View style={styles.search}>
        <TouchableOpacity style={styles.button} onPress={() => {
          setOpenListCustomer(true)
          storeSession("listCustomer", listCustomer)
        }
        }>
          <Text style={styles.buttonText}>Picking Customer</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity style={styles.button} onPress={acceptBooking}>
          <Text style={styles.buttonText}>Test event</Text>
        </TouchableOpacity> */}

        {/* <TouchableOpacity style={styles.button} onPress={traceRoute}>
          <Text style={styles.buttonText}>Trace route</Text>
        </TouchableOpacity> */}
        {distance && duration && price ? (
          <View>
            <Text>Distance: {distance.toFixed(2)}</Text>
            <Text>Duration: {Math.ceil(duration)} min</Text>
            <Text>Price: {Math.ceil(price)} VND</Text>
            {!isAcceptTrip &&
              <TouchableOpacity style={styles.button} onPress={acceptTrip}>
                <Text style={styles.buttonText}>Accept trip</Text>
              </TouchableOpacity>}
          </View>
        ) : null}

      </View>
      {openListCustomer && (
        <View style={styles.listCustomer}>
          <SwipeList data={listCustomer} />
          <TouchableOpacity style={styles.button} onPress={() => setOpenListCustomer(false)}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      )}

      {!isPickUp && isAcceptTrip && tripInfo && Object.keys(tripInfo).length > 0 &&
        <View style={styles.eventButton}>
          <TouchableOpacity style={styles.button} onPress={pickUp}>
            <Text style={styles.buttonText}>Pick Up Customer</Text>
          </TouchableOpacity>
        </View>
      }
      {complete && isPickUp &&
        <View style={styles.eventButton}>
          <TouchableOpacity style={styles.button} onPress={tripComplete}>
            <Text style={styles.buttonText}>Complete</Text>
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
  listCustomer: {
    position: "absolute",
    width: "95%",
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
    height: "50%"
    //paddingBottom: 30,

  },
  eventButton: {
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
  },

  buttonText: {
    textAlign: "center",
    color: "white"
  },
  listText: {
    textAlign: "center",
    padding: 5,
  },
  prettyList: {
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

  },
  delRow: {
    backgroundColor: 'red',

  },
  markerImage: {
    width: 35,
    height: 35
  },
  backTextWhite: {
    color: '#FFF',
  },
  rowFront: {
    alignItems: 'center',
    backgroundColor: 'white',

    justifyContent: 'center',
    height: 50,

    shadowColor: "#000",
    borderRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,

    margin: 10,
  },
  rowBack: {

    alignItems: 'center',
    backgroundColor: 'white',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 15,
    margin: 10,
  },
  backRightBtn: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    width: 75,

  },
  backRightBtnRight: {

    backgroundColor: 'red',
    right: 0,
    borderRadius: 10,
  },
});