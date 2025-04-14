import { Linking, StyleSheet, Text, TextProps, TouchableOpacity, View } from 'react-native'
import React from 'react'

import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from './ThemedText';

export type ThemedTextProps = TextProps & {
    children: string,
};
const FormatedText = ({ children, style, ...rest }: ThemedTextProps) => {






    const formatText = (text: string, style?: any, rest?: any) => {
        if (!text) return null;

        // Regex to detect URLs
        const urlRegex = /(https?:\/\/[^\s]+)/g;

        // Regex to detect phone numbers (+263 or 07 formats)
        const phoneRegex = /(\+263\d{9}|07\d{8})/g;

        // Regex to detect email addresses
        const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;


        // Split by markdown, URLs, phone numbers, or emails
        const parts = text.split(/(\*\*.*?\*\*|_.*?_|`.*?`|https?:\/\/[^\s]+|\+263\d{9}|07\d{8}|[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g);


        return parts.map((part: string, index: number) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return (
                    <ThemedText
                        key={index}
                        {...rest}
                        style={[{ fontFamily: 'Bold' }, style]}
                        type="defaultSemiBold"
                    >
                        {part.slice(2, -2)}
                    </ThemedText>
                );
            } else if (part.startsWith('_') && part.endsWith('_')) {
                return (
                    <ThemedText {...rest} style={style} key={index} type="italic">
                        {part.slice(1, -1)}
                    </ThemedText>
                );
            } else if (part.startsWith('`') && part.endsWith('`')) {
                return (
                    <ThemedText {...rest} style={style} key={index} type="title">
                        {part.slice(1, -1)}
                    </ThemedText>
                );
            } else if (urlRegex.test(part)) {
                // If the part is a URL
                return (
                    <ThemedText
                        {...rest}
                        key={index}
                        onPress={() => Linking.openURL(part)}
                        style={[style, { color: '#2F80ED' }]}
                    >
                        {part}
                    </ThemedText>
                );
            } else if (phoneRegex.test(part)) {
                // If the part is a phone number
                const formattedPhone = part.startsWith('07')
                    ? `+263${part.slice(1)}` // Convert 07 to +263 format
                    : part; // Keep +263 format as is
                return (
                    <ThemedText
                        {...rest}
                        key={index}
                        onPress={() => Linking.openURL(`tel:${formattedPhone}`)}
                        style={[style, { fontWeight: 'bold', textDecorationLine: 'underline' }]}
                    >
                        {formattedPhone}
                    </ThemedText>
                );
            } else if (emailRegex.test(part)) {
                // If the part is an email address
                return (
                    <ThemedText
                        {...rest}
                        key={index}
                        onPress={() => Linking.openURL(`mailto:${part}`)}
                        style={[style, { color: '#2F80ED' }]}
                    >
                        {part}
                    </ThemedText>
                );
            } else {
                // Plain text
                return (
                    <ThemedText style={style} {...rest} key={index}>
                        {part}
                    </ThemedText>
                );
            }
        });
    };


    /*

    
    
    */



    return (
        <ThemedText {...rest}>
            {formatText(children)}
        </ThemedText>
    )
}

export default FormatedText

const styles = StyleSheet.create({})






/*

import React from 'react';
import { Text, StyleSheet } from 'react-native';

const FormattedText = ({ children }) => {
    const styles = StyleSheet.create({
        bold: {
            fontWeight: 'bold',
        },
        italic: {
            fontStyle: 'italic',
        },
        code: {
            fontFamily: 'monospace',
            backgroundColor: '#f0f0f0',
            padding: 2,
            borderRadius: 3,
        },
    });

    // Function to parse and format the text
   

    return <Text>{formatText(children)}</Text>;
};

export default FormattedText;

*/