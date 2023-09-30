import React, { useEffect, useState } from 'react';
import { GOOGLE_API_KEY } from '../../env';
import {
    GooglePlaceDetail,
    GooglePlacesAutocomplete,
} from "react-native-google-places-autocomplete";
import {
    StyleSheet,
    Text,
} from "react-native";
import { theme } from '../core/theme'

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
          onPress={(data, details) => {
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
export default InputAutocomplete
const styles = StyleSheet.create({
    pickingAdr: {
        borderRadius: 5,
        borderColor: "black",
        borderWidth: 0.25,
        flex: 1,
        backgroundColor: theme.colors.surface,
    },
});