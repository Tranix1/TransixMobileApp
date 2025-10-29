import React from 'react';
import { router } from 'expo-router';

export default function Driver() {
    // Redirect to the Index component which shows the driver list
    React.useEffect(() => {
        router.replace('/Fleet/Driver/Index');
    }, []);

    return null;
}

