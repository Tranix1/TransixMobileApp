import React from 'react';
import { View, Image, TouchableOpacity,ToastAndroid } from 'react-native';
import { ThemedText } from './ThemedText'; // your custom text component
import { hp, wp } from "@/constants/common";
import { useThemeColor } from '@/hooks/useThemeColor';

interface DocumentUploaderProps {
  documents: any;
  title: string;
  subtitle: string;
  buttonTiitle: string;
  onPickDocument: () => void;
  disabled ?: boolean;
  toastMessage ?: string
}


export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  documents,
  title,
  subtitle,
buttonTiitle,
  onPickDocument,
disabled,
toastMessage
}) => {
        const background = useThemeColor('background');
        const backgroundLight = useThemeColor("backgroundLight")
        const icon = useThemeColor("icon")
    

  return documents ? (
    <View
      style={{
        width: wp(45),
        alignSelf: 'center',
        backgroundColor: backgroundLight,
        borderRadius: 8,
        padding: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        marginBottom: 10,
        paddingHorizontal:10
      }}
    >
      {documents.name.toLowerCase().endsWith('.pdf') ? (
        <>
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              height: wp(10),
              backgroundColor: backgroundLight,
              borderRadius: 8,
            }}
          >
            <ThemedText
              style={{
                fontSize: 50,
                color: '#004d40',
              }}
            >
              📄
            </ThemedText>
          </View>
          <ThemedText
            style={{
              marginTop: 8,
              textAlign: 'center',
              fontSize: 12,
              color: '#004d40',
              fontWeight: '600',
            }}
          >
            {documents.name}
          </ThemedText>
        </>
      ) : (
        <>
        <ThemedText style={{textAlign:"center" ,color:icon}} type='tiny'> {buttonTiitle} </ThemedText>
          <Image
            source={{ uri: documents.uri }}
            style={{
              width: '100%',
              height: wp(20),
              borderRadius: 8,
            }}
            resizeMode="cover"
          />
          <ThemedText
            style={{
              marginTop: 8,
              textAlign: 'center',
              fontSize: 12,
              // fontWeight: '600',`
            }}
          >
            {documents.name}
          </ThemedText>
        </>
      )}
    </View>
  ) : (
    <View>
      <ThemedText style={{ fontSize: 13.6 }}>{title}</ThemedText>
      <ThemedText type="tiny">{subtitle}</ThemedText>

      <TouchableOpacity
        onPress={() => {
  if (disabled && toastMessage) {
        ToastAndroid.show(toastMessage , ToastAndroid.SHORT);

  } else {
    onPickDocument();
  }
}}
        style={{
          backgroundColor: '#004d40',
          height: 45,
          justifyContent: 'center',
          alignSelf: 'center',
          marginVertical: 10,
          width: 280,
          borderRadius: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        <ThemedText
          style={{
            textAlign: 'center',
            color: 'white',
            fontWeight: '600',
            fontSize: 14,
          }}
        >
          {buttonTiitle}
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
};
