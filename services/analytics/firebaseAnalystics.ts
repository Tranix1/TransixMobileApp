import analytics from '@react-native-firebase/analytics';

export async function trackScreen(screenName: string) {
    try {
        await analytics().logScreenView({
            screen_name: screenName,
            screen_class: screenName,
        });
    } catch (e) {
        console.log('Analytics error:', e);
    }
}

export async function trackEventFirebase(
    event: string,
    params?: Record<string, any>
) {
    try {
        await analytics().logEvent(event, params);
    } catch (e) {
        console.log('Analytics error:', e);
    }
}

export async function setUserProperties(user: {
    uid: string;
    accountType?: string;
    city?: string;
    country?: string;
    verificationStatus?: string;
}) {
    try {
        await analytics().setUserId(user.uid);

        if (user.accountType)
            await analytics().setUserProperty('account_type', user.accountType);

        if (user.city)
            await analytics().setUserProperty('city', user.city);

        if (user.country)
            await analytics().setUserProperty('country', user.country);

        if (user.verificationStatus)
            await analytics().setUserProperty(
                'verification_status',
                user.verificationStatus
            );
    } catch (e) {
        console.log('Analytics error:', e);
    }
}