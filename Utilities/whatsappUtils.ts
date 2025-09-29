import { Linking, Alert } from 'react-native';

export const openWhatsApp = (phoneNumber: string, message: string) => {
    const cleanPhoneNumber = phoneNumber.replace(/\D/g, ''); // Remove all non-digits
    const whatsappUrl = `whatsapp://send?phone=${cleanPhoneNumber}&text=${encodeURIComponent(message)}`;

    Linking.canOpenURL(whatsappUrl)
        .then((supported) => {
            if (supported) {
                return Linking.openURL(whatsappUrl);
            } else {
                // Fallback to web WhatsApp if app is not installed
                const webWhatsappUrl = `https://wa.me/${cleanPhoneNumber}?text=${encodeURIComponent(message)}`;
                return Linking.openURL(webWhatsappUrl);
            }
        })
        .catch((err) => {
            console.error('Error opening WhatsApp:', err);
            Alert.alert('Error', 'Unable to open WhatsApp. Please try again.');
        });
};

export const getContactMessage = (serviceType: 'fuel' | 'serviceStation' | 'warehouse' | 'truckStop') => {
    const messages = {
        fuel: `🚛 *Fuel Station Partnership Opportunity* 🚛

Hi! I'm interested in partnering with your fuel station to provide quality fuel at competitive prices through the Transix platform.

*How It Works:*
1️⃣ Customers view your fuel prices & location in our app
2️⃣ They get GPS navigation directly to your station
3️⃣ Online payment is processed before arrival
4️⃣ Customers arrive, fuel up, and leave hassle-free
5️⃣ You get paid instantly - no waiting for payments!

*Why Partner With Us?*
✅ Get customers fast - thousands of truckers use our app
✅ Increase your fuel sales volume by 40-60%
✅ Reach new customers in your area
✅ Zero payment delays - instant settlements
✅ Real-time inventory management

*Cool Features for Partners:*
• 📍 Live GPS tracking & navigation
• 💳 Secure online payments (cards, mobile money)
• ⭐ Customer reviews & ratings system
• 📊 Sales analytics dashboard
• 🎯 Targeted marketing to nearby truckers
• 📱 Easy inventory updates
• 🚨 Low fuel alerts to customers

Ready to grow your business? Let's discuss partnership details!

Best regards,
Transix Team`,

        serviceStation: `🔧 *Service Station Partnership Opportunity* 🔧

Hi! I'm interested in partnering with your service station to provide quality vehicle maintenance and repair services through the Transix platform.

*How It Works:*
1️⃣ Customers view your services & prices in our app
2️⃣ They book appointments and get GPS navigation
3️⃣ Online payment is processed before arrival
4️⃣ Customers arrive, get serviced, and leave satisfied
5️⃣ You get paid instantly - no payment delays!

*Why Partner With Us?*
✅ Get customers fast - thousands of truckers use our app
✅ Increase your service bookings by 50-70%
✅ Reach new customers in your area
✅ Zero payment delays - instant settlements
✅ Easy appointment management

*Cool Features for Partners:*
• 📍 Live GPS tracking & navigation
• 💳 Secure online payments (cards, mobile money)
• ⭐ Customer reviews & ratings system
• 📊 Service analytics dashboard
• 🎯 Targeted marketing to nearby truckers
• 📱 Easy service menu updates
• 🚨 Maintenance reminders to customers
• 📅 Smart appointment scheduling

Ready to grow your business? Let's discuss partnership details!

Best regards,
Transix Team`,

        warehouse: `📦 *Warehouse Partnership Opportunity* 📦

Hi! I'm interested in partnering with your warehouse to provide storage and logistics services through the Transix platform.

*How It Works:*
1️⃣ Customers view your storage rates & availability
2️⃣ They book space and get GPS navigation
3️⃣ Online payment is processed before arrival
4️⃣ Customers arrive, store goods, and track everything
5️⃣ You get paid instantly - no payment delays!

*Why Partner With Us?*
✅ Get customers fast - thousands of businesses use our app
✅ Increase your storage utilization by 60-80%
✅ Reach new customers in your area
✅ Zero payment delays - instant settlements
✅ Real-time space management

*Cool Features for Partners:*
• 📍 Live GPS tracking & navigation
• 💳 Secure online payments (cards, mobile money)
• ⭐ Customer reviews & ratings system
• 📊 Storage analytics dashboard
• 🎯 Targeted marketing to nearby businesses
• 📱 Real-time space availability updates
• 🚨 Security monitoring alerts
• 📦 Inventory tracking system

Ready to grow your business? Let's discuss partnership details!

Best regards,
Transix Team`,

        truckStop: `🛑 *Truck Stop Partnership Opportunity* 🛑

Hi! I'm interested in partnering with your truck stop to provide rest, food, and services through the Transix platform.

*How It Works:*
1️⃣ Customers view your amenities & prices in our app
2️⃣ They get GPS navigation directly to your stop
3️⃣ Online payment is processed before arrival
4️⃣ Customers arrive, rest, eat, and leave refreshed
5️⃣ You get paid instantly - no payment delays!

*Why Partner With Us?*
✅ Get customers fast - thousands of truckers use our app
✅ Increase your foot traffic by 50-70%
✅ Reach new customers in your area
✅ Zero payment delays - instant settlements
✅ Easy amenity management

*Cool Features for Partners:*
• 📍 Live GPS tracking & navigation
• 💳 Secure online payments (cards, mobile money)
• ⭐ Customer reviews & ratings system
• 📊 Traffic analytics dashboard
• 🎯 Targeted marketing to nearby truckers
• 📱 Easy menu & amenity updates
• 🚨 Real-time capacity alerts
• 🍽️ Food ordering system
• 🛏️ Rest area booking

Ready to grow your business? Let's discuss partnership details!

Best regards,
Transix Team`
    };

    return messages[serviceType];
};
