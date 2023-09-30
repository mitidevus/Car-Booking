// import React, { useEffect, useState, useRef } from 'react';
// import MapView, { LatLng, Marker, PROVIDER_GOOGLE } from "react-native-maps";
// import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
// import { SwipeListView } from 'react-native-swipe-list-view';
// import { Dimensions, Platform, Text, View, StyleSheet, SafeAreaView, TextInput, KeyboardAvoidingView, Pressable, TouchableOpacity } from 'react-native';
// import * as Location from 'expo-location';
// import BackButton from '../components/BackButton'
// import MapViewDirections from "react-native-maps-directions";
// import Ionicons from '@expo/vector-icons/Ionicons';
// import tailwind from 'twrnc';
// import { theme } from '../core/theme'
// import Button from '../components/Button'
// import { GOOGLE_API_KEY } from '../../env';
// import Constants from "expo-constants";
// import { location_user } from '../data/location';
// import SwipeList from '../components/SwipeList';
// import {
//   GooglePlaceDetail,
//   GooglePlacesAutocomplete,
// } from "react-native-google-places-autocomplete";


// export default function traceRoute(origin, destination, showDirections, setDistance, setDuration, setPrice) {


//   const traceRouteOnReady = (args: any) => {
//     if (args) {
//       // args.distance
//       // args.duration
//       setDistance(args.distance);
//       setDuration(args.duration);
//       setPrice(args.distance * 5 * 1000);
//     }
//   };
//   return (
//     <>
//       {origin && <Marker coordinate={origin} />}
//       {destination && <Marker coordinate={destination} pinColor={'blue'} />}
//       {showDirections && origin && destination && (
//         <MapViewDirections
//           origin={origin}
//           destination={destination}
//           apikey={GOOGLE_API_KEY}
//           strokeColor="#6644ff"
//           strokeWidth={4}
//           onReady={traceRouteOnReady}
//         />
//       )
//       }
//     </>
//   )
// }