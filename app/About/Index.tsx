import { TouchableOpacity, View, Linking,StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { wp } from "@/constants/common";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useAuth } from "@/context/AuthContext";
function About() {

    const background = useThemeColor("background");
        const {  Logout,  } = useAuth();
    

  const openWhatsApp = () => {
    const phoneNumber = "263716325160";
    const message = "Hello Transix, I would like more information about your services.";
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    Linking.openURL(url);
  };

  const openEmail = () => {
    const email = "transix16@gmail.com";
    const subject = "Inquiry about Transix Services";
    const body = "Hello, I would like to learn more about your platform.";
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    Linking.openURL(url);
  };

  return (
    <View style={{ flex: 1, padding: 20, gap: 24, backgroundColor:background }}>
          <View style={styles.header}>
                  <ThemedText type="title">About Transix</ThemedText>
                </View>
                <TouchableOpacity onPress={Logout}>
                  <ThemedText>Logout</ThemedText>
                </TouchableOpacity>
      {/* About Section */}
      <View style={{ gap: 10 }}>

        <ThemedText>
          Transix is a modern technology platform focused on transforming the 
          transport and logistics industry across Africa.
        </ThemedText>

        <ThemedText>
          We provide intelligent solutions for vehicle tracking, fleet management, 
          and logistics brokerage—helping businesses operate more efficiently and 
          make better decisions in real time.
        </ThemedText>

        <ThemedText>
          Whether you are looking to track vehicles, manage a fleet, or access 
          logistics opportunities, Transix gives you the tools to scale and succeed.
        </ThemedText>
      </View>

      {/* Contact Section */}
      <View style={{ gap: 12 }}>
        <ThemedText type="title">Contact Us</ThemedText>

        <ThemedText>
          Reach out to us for more information, to get a tracker installed, or to 
          better understand how Transix can support your operations.
        </ThemedText>

        <TouchableOpacity
          onPress={openWhatsApp}
          style={{
            padding: 14,
            borderRadius: 12,
            backgroundColor: "#25D366",
          }}
        >
          <ThemedText style={{ color: "#fff" }}>
            Chat on WhatsApp
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={openEmail}
          style={{
            padding: 14,
            borderRadius: 12,
            backgroundColor: "#333",
          }}
        >
          <ThemedText style={{ color: "#fff" }}>
            Send Email
          </ThemedText>
        </TouchableOpacity>

      </View>

    </View>
  );
}

export default About;
const styles = StyleSheet.create({
     header: {
        padding: wp(2.5),
        alignItems: 'center',
      },
      title: {
        fontSize: wp(6),
        fontWeight: 'bold',
        // color: '#333',
      },
})