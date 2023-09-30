// // import React, { useEffect, useState, useRef } from 'react';
// // import MapView, { LatLng, Marker, PROVIDER_GOOGLE } from "react-native-maps";
// // import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
// // import { Dimensions, Platform, Text, View, StyleSheet, SafeAreaView, TextInput, KeyboardAvoidingView, Pressable, TouchableOpacity } from 'react-native';
// // import * as Location from 'expo-location';
// // import BackButton from '../components/BackButton'
// // import MapViewDirections from "react-native-maps-directions";
// // import { theme } from '../core/theme'
// // import Button from '../components/Button'
// // import { GOOGLE_API_KEY } from '../../env';
// // import Constants from "expo-constants";
// // import {
// //   GooglePlaceDetail,
// //   GooglePlacesAutocomplete,
// // } from "react-native-google-places-autocomplete";
// // type InputAutocompleteProps = {
// //   label: string;
// //   placeholder?: string;
// //   onPlaceSelected: (details: GooglePlaceDetail | null) => void;
// // };

// // function InputAutocomplete({
// //   label,
// //   placeholder,
// //   onPlaceSelected,
// // }: InputAutocompleteProps) {
// //   return (
// //     <>
// //       <Text>{label}</Text>
// //       <GooglePlacesAutocomplete
// //         styles={{ textInput: styles.pickingAdr }}
// //         placeholder={placeholder || ""}
// //         fetchDetails
// //         onPress={(data, details) => {
// //           onPlaceSelected(details);
// //         }}
// //         query={{
// //           key: GOOGLE_API_KEY,
// //           language: "pt-BR",
// //         }}
// //       />
// //     </>
// //   );
// // }
// // export default function Map({ navigation }) {

// //   // useEffect(() => {
// //   //   (async () => {

// //   //     let { status } = await Location.requestForegroundPermissionsAsync();
// //   //     if (status !== 'granted') {
// //   //       setErrorMsg('Permission to access location was denied');
// //   //       return;
// //   //     }

// //   //     let location = await Location.getCurrentPositionAsync({});
// //   //     setLocation(location);
// //   //     setPin({
// //   //       latitude: location.coords.latitude,
// //   //       longitude: location.coords.longitude,
// //   //     })
// //   //   })();
// //   // }, []);


// //   const [origin, setOrigin] = useState<LatLng | null>();
// //   const [destination, setDestination] = useState<LatLng | null>();
// //   const [showDirections, setShowDirections] = useState(false);
// //   const [distance, setDistance] = useState(0);
// //   const [duration, setDuration] = useState(0);
// //   const [price, setPrice] = useState(0);
// //   const mapRef = useRef<MapView>(null);

// //   const moveTo = async (position: LatLng) => {
// //     const camera = await mapRef.current?.getCamera();
// //     if (camera) {
// //       camera.center = position;
// //       mapRef.current?.animateCamera(camera, { duration: 1000 });
// //     }
// //   };

// //   const edgePaddingValue = 70;

// //   const edgePadding = {
// //     top: edgePaddingValue,
// //     right: edgePaddingValue,
// //     bottom: edgePaddingValue,
// //     left: edgePaddingValue,
// //   };

// //   const traceRouteOnReady = (args: any) => {
// //     if (args) {
// //       // args.distance
// //       // args.duration
// //       setDistance(args.distance);
// //       setDuration(args.duration);
// //       setPrice(args.distance * 5 * 1000);
// //     }
// //   };

// //   const traceRoute = () => {
// //     if (origin && destination) {
// //       setShowDirections(true);
// //       mapRef.current?.fitToCoordinates([origin, destination], { edgePadding });
// //     }
// //   };

// //   const onPlaceSelected = (
// //     details: GooglePlaceDetail | null,
// //     flag: "origin" | "destination"
// //   ) => {
// //     const set = flag === "origin" ? setOrigin : setDestination;
// //     const position = {
// //       latitude: details?.geometry.location.lat || 0,
// //       longitude: details?.geometry.location.lng || 0,
// //     }; moveTo
// //     set(position);
// //     moveTo(position);
// //     console.log(position)
// //   };
// //   return (
// //     <SafeAreaView style={styles.container} >
// //       <MapView
// //         style={styles.map}
// //         ref={mapRef}
// //         initialRegion={{
// //           latitude: 13.406,
// //           longitude: 123.3753,
// //           latitudeDelta: 0.005,
// //           longitudeDelta: 0.0005,
// //         }
// //         }
// //         provider={PROVIDER_GOOGLE}
// //       // showsUserLocation={true}
// //       // onUserLocationChange={(e) => {
// //       //   console.log(e.nativeEvent.coordinate)
// //       //   setPin({
// //       //     latitude: e.nativeEvent.coordinate.latitude,
// //       //     longitude: e.nativeEvent.coordinate.longitude,
// //       //   })
// //       // }}
// //       // onPress={(e) => {
// //       //   console.log(e.nativeEvent.coordinate)
// //       //   setDestination({
// //       //     latitude: e.nativeEvent.coordinate.latitude,
// //       //     longitude: e.nativeEvent.coordinate.longitude,
// //       //   })
// //       // }}
// //       >
// //         {origin && <Marker coordinate={origin} />}
// //         {destination && <Marker coordinate={destination} pinColor={'blue'}/>}
// //         {showDirections && origin && destination && (
// //           <MapViewDirections
// //             origin={origin}
// //             destination={destination}
// //             apikey={GOOGLE_API_KEY}
// //             strokeColor="#6644ff"
// //             strokeWidth={4}
// //             onReady={traceRouteOnReady}
// //           />
// //         )}
// //       </MapView>

// //       <View style={styles.search}>
// //         <InputAutocomplete
// //           label="Start"
// //           onPlaceSelected={(details) => {
// //             onPlaceSelected(details, "origin");
// //           }}
// //         />
// //         <InputAutocomplete
// //           label="Destination"
// //           onPlaceSelected={(details) => {
// //             onPlaceSelected(details, "destination");
// //           }}
// //         />

// //         <TouchableOpacity style={styles.button} onPress={traceRoute}>
// //           <Text style={styles.buttonText}>Trace route</Text>
// //         </TouchableOpacity>

// //         {distance && duration && price ? (
// //           <View>
// //             <Text>Distance: {distance.toFixed(2)}</Text>
// //             <Text>Duration: {Math.ceil(duration)} min</Text>
// //             <Text>Price: {Math.ceil(price)} VND</Text>
// //             <TouchableOpacity style={styles.button} onPress={() => alert("Booking success")}>
// //               <Text style={styles.buttonText}>Booking</Text>
// //             </TouchableOpacity>
// //           </View>
// //         ) : null}

// //       </View>

// //       <BackButton goBack={navigation.goBack} />

// //     </SafeAreaView>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// //   pickingAdr: {
// //     borderRadius: 5,
// //     borderColor: "black",
// //     borderWidth: 0.25,
// //     flex: 1,
// //     backgroundColor: theme.colors.surface,
// //   },
// //   backButton: {
// //     position: "absolute",
// //     top: 0,
// //     left: 10,
// //   },

// //   search: {
// //     position: "absolute",
// //     width: "95%",
// //     top: 70,
// //     backgroundColor: 'white',
// //     shadowColor: "#000",
// //     borderRadius: 10,
// //     shadowOffset: {
// //       width: 0,
// //       height: 4,
// //     },
// //     shadowOpacity: 0.30,
// //     shadowRadius: 4.65,
// //     elevation: 8,
// //     padding: 10,
// //     paddingTop: 20,
// //     //paddingBottom: 30,

// //   },

// //   map: {
// //     width: '100%',
// //     height: '100%',
// //   },
// //   button: {
// //     backgroundColor: theme.colors.primary,
// //     paddingVertical: 12,
// //     marginTop: 16,
// //     marginBottom: 16,
// //     borderRadius: 10,
// //     textAlign: "center",
// //   },
// //   buttonText: {
// //     textAlign: "center",
// //     color: "white"
// //   },
// // });

// __________________________________________

// import React, { useEffect, useState, useRef } from 'react';
// import MapView, { LatLng, Marker, PROVIDER_GOOGLE } from "react-native-maps";
// import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
// import DropDownPicker from 'react-native-dropdown-picker';
// import {
//   Dimensions,
//   Platform,
//   Text,
//   View,
//   StyleSheet,
//   SafeAreaView,
//   TextInput,
//   KeyboardAvoidingView,
//   Pressable,
//   TouchableOpacity,
//   NativeModules
// } from 'react-native';
// import * as Location from 'expo-location';
// import BackButton from '../components/BackButton'
// import MapViewDirections from "react-native-maps-directions";
// import { theme } from '../core/theme'
// import Button from '../components/Button'
// import { GOOGLE_API_KEY } from '../../env';
// import Constants from "expo-constants";
// import {
//   GooglePlaceDetail,
//   GooglePlacesAutocomplete,
// } from "react-native-google-places-autocomplete";
// import InputAutocomplete from '../components/InputAutoComplete';

// // type InputAutocompleteProps = {
// //   label: string;
// //   placeholder?: string;
// //   onPlaceSelected: (details: GooglePlaceDetail | null) => void;
// // };

// // function InputAutocomplete({
// //   label,
// //   placeholder,
// //   onPlaceSelected,
// // }: InputAutocompleteProps) {
// //   return (
// //     <>
// //       <Text>{label}</Text>
// //       <GooglePlacesAutocomplete
// //         styles={{ textInput: styles.pickingAdr }}
// //         placeholder={placeholder || ""}
// //         fetchDetails
// //         onPress={(data, details) => {
// //           onPlaceSelected(details);
// //         }}
// //         query={{
// //           key: GOOGLE_API_KEY,
// //           language: "pt-BR",
// //         }}
// //       />
// //     </>
// //   );
// // }
// export default function Map({ navigation }) {

//   // useEffect(() => {
//   //   (async () => {

//   //     let { status } = await Location.requestForegroundPermissionsAsync();
//   //     if (status !== 'granted') {
//   //       setErrorMsg('Permission to access location was denied');
//   //       return;
//   //     }

//   //     let location = await Location.getCurrentPositionAsync({});
//   //     setLocation(location);
//   //     setPin({
//   //       latitude: location.coords.latitude,
//   //       longitude: location.coords.longitude,
//   //     })
//   //   })();
//   // }, []);


//   const [origin, setOrigin] = useState<LatLng | null>();
//   const [destination, setDestination] = useState<LatLng | null>();
//   const [showDirections, setShowDirections] = useState(false);
//   const [distance, setDistance] = useState(0);
//   const [duration, setDuration] = useState(0);
//   const [price, setPrice] = useState(null);
//   const [locationStart, setLocationStart] = useState("")
//   const [locationEnd, setLocationEnd] = useState("")
//   const [isBooking, setIsBooking] = useState(true)
//   const [res, setRes] = useState(null)

//   const mapRef = useRef<MapView>(null);
//   // var ws = useRef(null);
//   // var ws = new WebSocket('ws://127.0.0.1:8086');
//   // const [serverState, setServerState] = React.useState('Loading...');
//   // const [disableButton, setDisableButton] = React.useState(true);
//   // const [inputFieldEmpty, setInputFieldEmpty] = React.useState(true);
//   // const [serverMessages, setServerMessages] = React.useState([]);

//   const [driverInfo, setDriverInfo] = useState(null)

//   const [websocketUrl, setWebsocketUrl] = useState(null)
//   var ws = useRef(websocketUrl).current;


//   const moveTo = async (position: LatLng) => {
//     const camera = await mapRef.current?.getCamera();
//     if (camera) {
//       camera.center = position;
//       mapRef.current?.animateCamera(camera, { duration: 1000 });
//     }
//   };

//   useEffect(() => {
//     // v1/user/preview-booking
//     const customHeaders = {
//       Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0ZDhmMWI5ODY2NmQzNDA3YjIzYjgzOSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNjkyNjgxMDExLCJleHAiOjE2OTQ0MDkwMTF9.FgDcCNAjhV5OEspLL5GT0CiRYE9CtshLqtjMnPYXKqQ',
//     };

//     // Replace with your WebSocket server URL
//     setWebsocketUrl(new WebSocket('ws://192.168.1.13:8086/v1/user/booking'))
    
//     if (websocketUrl != null) {
//       fetch(websocketUrl, {
//         headers: customHeaders
//       }).then((res) => {
//         console.log(res)
//         ws.onopen = () => {
//           console.log("Connected")
//         };

//         ws.onclose = (e) => {
//           console.log("Disconnected")
//         };
//         ws.onerror = (e) => {
//           console.log(e)
//         };
//         ws.onmessage = (e) => {
//           console.log(e.data)
//           setRes(e.data)
//           console.log("On message")
//         };
//         return () => {
//           ws.close()
//         }
//       }).catch((err) => console.log(err))
//     }
//   }, [])



//   const edgePaddingValue = 70;

//   const edgePadding = {
//     top: edgePaddingValue,
//     right: edgePaddingValue,
//     bottom: edgePaddingValue,
//     left: edgePaddingValue,
//   };

//   const traceRouteOnReady = async (args: any) => {
//     if (args) {
//       // args.distance
//       // args.duration
//       setDistance(args.distance);
//       setDuration(args.duration);
//       let previewBooking = {
//         "longitudeFrom": origin.longitude.toString(),
//         "latitudeFrom": origin.latitude.toString(),
//         "addressFrom": locationStart,
//         "longitudeTo": destination.longitude.toString(),
//         "latitudeTo": destination.latitude.toString(),
//         "addressTo": locationEnd,
//         "distance": args.distance
//       }
//       console.log(previewBooking)
//       try {
//         await fetch('http://192.168.1.13:8086/v1/user/preview-booking', {
//           method: 'POST',
//           headers: {
//             Accept: 'application/json',
//             'Content-Type': 'application/json'
//           },
//           body: JSON.stringify(previewBooking)
//         }).then((res) => res.json()).then((data) => {
//           setPrice(data.data.previewBooking)
//           setItems(getPrice(data.data.previewBooking))
//         })
//       }
//       catch (err) {
//         console.log(err + " req")
//       }
//     }
//   };

//   const traceRoute = () => {
//     if (origin && destination) {
//       setShowDirections(true);
//       mapRef.current?.fitToCoordinates([origin, destination], { edgePadding });
//     }

//   };
//   const onPlaceSelected = (
//     details: GooglePlaceDetail | null,
//     flag: "origin" | "destination"
//   ) => {
//     const set = flag === "origin" ? setOrigin : setDestination;
//     const setLocation = flag === "origin" ? setLocationStart : setLocationEnd;
//     const position = {
//       latitude: details?.geometry.location.lat || 0,
//       longitude: details?.geometry.location.lng || 0,
//     }; moveTo
//     set(position);
//     moveTo(position);
//     let location = ""
//     for (let i = 0; i < 5; i++) {
//       location += details.address_components[i].long_name
//       if (i != 4)
//         location += ", "
//     }
//     setLocation(location)
//   };

//   const [open, setOpen] = useState(false);
//   const [value, setValue] = useState(null);
//   const [items, setItems] = useState(null);
//   function getPrice(p) {
//     let data = []
//     console.log(p)
//     let i = 0
//     p.map((x, idx) => {
//       let cost = "Price: " + x.price.toString() + " Car type: " + x.serviceCode;
//       let option = "{\"price\": " + x.price.toString() + ", \"serviceCode\": \"" + x.serviceCode + "\"}";
//       const obj = {
//         label: cost,
//         value: option
//       }
//       data.push(obj)
//       i += 1
//     });
//     return data
//   }
//   function booking() {
//     const data = {
//       "type": "booking",
//       "payload": {
//         "userId": "612345678901234567890123",
//         "longitudeFrom": origin.longitude.toString(),
//         "latitudeFrom": origin.latitude.toString(),
//         "addressFrom": locationStart,
//         "longitudeTo": destination.longitude.toString(),
//         "latitudeTo": destination.latitude.toString(),
//         "addressTo": locationEnd,
//         "serviceCode": JSON.parse(value).serviceCode, //ServiceType (Standard, Plus) - NumSeat
//         "price": JSON.parse(value).price
//       }
//     }
//     ws.send(JSON.stringify(data))
//     setIsBooking(true)
//     alert(data)
//   }
//   function cancelBooking() {
//     const data = JSON.stringify({
//       "type": "cancel_booking",
//       "payload": {
//         "customerId": "612345678901234567890123"
//       }
//     })
//     ws.send(data)
//     setIsBooking(false)
//   }
//   //__________________________________________________________________

//   return (
//     <SafeAreaView style={styles.container} >
//       <MapView
//         style={styles.map}
//         ref={mapRef}
//         initialRegion={{
//           latitude: 13.406,
//           longitude: 123.3753,
//           latitudeDelta: 0.005,
//           longitudeDelta: 0.0005,
//         }
//         }
//         provider={PROVIDER_GOOGLE}
//       // showsUserLocation={true}
//       // onUserLocationChange={(e) => {
//       //   console.log(e.nativeEvent.coordinate)
//       //   setPin({
//       //     latitude: e.nativeEvent.coordinate.latitude,
//       //     longitude: e.nativeEvent.coordinate.longitude,
//       //   })
//       // }}
//       // onPress={(e) => {
//       //   console.log(e.nativeEvent.coordinate)
//       //   setDestination({
//       //     latitude: e.nativeEvent.coordinate.latitude,
//       //     longitude: e.nativeEvent.coordinate.longitude,
//       //   })
//       // }}
//       >
//         {origin && <Marker coordinate={origin} />}
//         {destination && <Marker coordinate={destination} pinColor={'blue'} />}
//         {showDirections && origin && destination && (
//           <MapViewDirections
//             origin={origin}
//             destination={destination}
//             apikey={GOOGLE_API_KEY}
//             strokeColor="#6644ff"
//             strokeWidth={4}
//             onReady={traceRouteOnReady}
//           />
//         )}
//       </MapView>

//       <View style={styles.search}>
//         <InputAutocomplete
//           label="Start"
//           onPlaceSelected={(details) => {
//             onPlaceSelected(details, "origin");
//           }}
//         />
//         <InputAutocomplete
//           label="Destination"
//           onPlaceSelected={(details) => {
//             onPlaceSelected(details, "destination");
//           }}
//         />

//         <TouchableOpacity style={styles.button} onPress={traceRoute}>
//           <Text style={styles.buttonText}>Trace route</Text>
//         </TouchableOpacity>

//         {distance && duration ? (
//           <View>
//             <Text>Distance: {distance.toFixed(2)} km</Text>
//             <Text>Duration: {Math.ceil(duration)} min</Text>
//             {value &&
//               <TouchableOpacity style={styles.button} onPress={booking}>
//                 <Text style={styles.buttonText}>Booking</Text>
//               </TouchableOpacity>
//             }
//             {price && items &&
//               <DropDownPicker
//                 open={open}
//                 value={value}
//                 items={items}
//                 setOpen={setOpen}
//                 setValue={setValue}
//                 setItems={setItems}
//                 zIndex={5000}
//               />
//             }
//           </View>
//         ) : null}
//       </View>
//       {isBooking &&
//         <View style={styles.cancelBooking}>
//           <TouchableOpacity style={styles.button} onPress={cancelBooking}>
//             <Text style={styles.buttonText}>Cancle booking</Text>
//           </TouchableOpacity>
//         </View>
//       }
//       <BackButton goBack={navigation.goBack} />

//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   pickingAdr: {
//     borderRadius: 5,
//     borderColor: "black",
//     borderWidth: 0.25,
//     flex: 1,
//     backgroundColor: theme.colors.surface,
//   },
//   backButton: {
//     position: "absolute",
//     top: 0,
//     left: 10,
//   },

//   search: {
//     position: "absolute",
//     width: "95%",
//     top: 70,
//     backgroundColor: 'white',
//     shadowColor: "#000",
//     borderRadius: 10,
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     shadowOpacity: 0.30,
//     shadowRadius: 4.65,
//     elevation: 8,
//     padding: 10,
//     paddingTop: 20,
//     //paddingBottom: 30,

//   },
//   cancelBooking: {
//     width: "95%",
//     bottom: 70,
//     backgroundColor: 'white',
//     shadowColor: "#000",
//     borderRadius: 10,
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     shadowOpacity: 0.30,
//     shadowRadius: 4.65,
//     elevation: 8,
//     padding: 10,
//     paddingTop: 20,
//   },
//   map: {
//     width: '100%',
//     height: '100%',
//   },
//   button: {
//     backgroundColor: theme.colors.primary,
//     paddingVertical: 12,
//     marginTop: 16,
//     marginBottom: 16,
//     borderRadius: 10,
//     textAlign: "center",
//   },
//   buttonText: {
//     textAlign: "center",
//     color: "white"
//   },
// });