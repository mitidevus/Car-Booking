import React, { useEffect, useState } from 'react';
import MapView, { Circle, Marker } from 'react-native-maps';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { Platform, Text, View, StyleSheet, SafeAreaView, TextInput, KeyboardAvoidingView} from 'react-native';
import * as Location from 'expo-location';


const TextInputExample = () => {
  const [start, setStart] = React.useState('');
  const [end, setEnd] = React.useState('');

  return (
    <KeyboardAwareScrollView>
      <View style={styles.search}>
        <View >
          <Text
            style={{ padding: 5 }}>From</Text>
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 5,
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,

              elevation: 5,
              fontSize: 1,

            }}>
            <TextInput
              editable
              multiline
              numberOfLines={1}
              maxLength={100}
              onChangeText={start => onChangeStart(start)}
              value={start}
              style={{ padding: 10 }}
            />
          </View>
        </View>
        <View>
          <Text style={{ padding: 5 }}>To</Text>
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 5,
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,

              elevation: 5,
              fontSize: 1,
            }}>
            <TextInput
              editable
              multiline
              numberOfLines={1}
              maxLength={100}
              onChangeText={end => onChangeStart(End)}
              value={end}
              style={{ padding: 10 }}
            />
          </View>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}
export default function Nav() {
  return (
    <KeyboardAwareScrollView>
      <View style={styles.search}>
        <View >
          <Text
            style={{ padding: 5 }}>From</Text>
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 5,
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,

              elevation: 5,
              fontSize: 1,

            }}>
            <TextInput
              editable
              multiline
              numberOfLines={1}
              maxLength={100}
              onChangeText={start => onChangeStart(start)}
              value={start}
              style={{ padding: 10 }}
            />
          </View>
        </View>
        <View>
          <Text style={{ padding: 5 }}>To</Text>
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 5,
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,

              elevation: 5,
              fontSize: 1,
            }}>
            <TextInput
              editable
              multiline
              numberOfLines={1}
              maxLength={100}
              onChangeText={end => onChangeStart(End)}
              value={end}
              style={{ padding: 10 }}
            />
          </View>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  nav: {
    backgroundColor: 'blue',
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});