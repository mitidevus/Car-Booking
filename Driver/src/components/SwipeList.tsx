// import React, { useState, useRef } from 'react';
// import {
//     Animated,
//     Dimensions,
//     Pressable,
//     StyleSheet,
//     Text,
//     TouchableHighlight,
//     TouchableOpacity,
//     View,
//     ScrollView,
// } from 'react-native';

// import { SwipeListView, SwipeRow } from 'react-native-swipe-list-view';
// import MapViewDirections from "react-native-maps-directions";
// import traceRoute from './traceRoute';
// import { LatLng } from 'react-native-maps';




// const styles = StyleSheet.create({
//     container: {
//         backgroundColor: 'white',
//         flex: 1,
//     },

//     backTextWhite: {
//         color: '#FFF',
//     },
//     rowFront: {
//         alignItems: 'center',
//         backgroundColor: 'white',

//         justifyContent: 'center',
//         height: 50,

//         shadowColor: "#000",
//         borderRadius: 10,
//         shadowOffset: {
//             width: 0,
//             height: 4,
//         },
//         shadowOpacity: 0.30,
//         shadowRadius: 4.65,
//         elevation: 8,

//         margin: 10,
//     },
//     rowBack: {

//         alignItems: 'center',
//         backgroundColor: 'white',
//         flex: 1,
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         paddingLeft: 15,
//         margin: 10,
//     },
//     backRightBtn: {
//         alignItems: 'center',
//         bottom: 0,
//         justifyContent: 'center',
//         position: 'absolute',
//         top: 0,
//         width: 75,

//     },
//     backRightBtnRight: {

//         backgroundColor: 'red',
//         right: 0,
//         borderRadius: 10,
//     },
// });