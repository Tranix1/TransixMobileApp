import React from "react";
import { View, Text, TouchableOpacity, StyleSheet , StatusBar } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

function FirsHomePage({
  setDspFrstPage,
  checkAuth,
  addStoreLoc,
  navigation,
  username,
  blackLWarning,
  blockVerifiedU,
  toggleDspLoads
}) {


   React.useEffect(() => {
    // Set the status bar color and style
    StatusBar.setBackgroundColor('#6a0c0c'); // Set the background color of the status bar
    StatusBar.setBarStyle('light-content'); // Set the style of the status bar text (light or dark)
  }, [username]);

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "white",
        zIndex: 210,
        padding: 10,
        paddingTop: 0,
      }}
    >
      <View>
        <View
          style={{
            justifyContent: "space-between",
            padding: 5,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Text style={styles.title}>Transix</Text>
          <TouchableOpacity onPress={checkAuth}>
            <Entypo
              name="menu"
              size={40}
              color="#6a0c0c"
              style={styles.shadow}
            />
          </TouchableOpacity>

        </View>



        <Text style={styles.subtitle}>
          The Future of Transport & Logistics
        </Text>
     


        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.greenButton}
            onPress={() => navigation.navigate("shopHome")}
          >
            <Text style={styles.buttonText}>Go To Store</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.redButton}
            onPress={toggleDspLoads}

          >
            <Text style={styles.buttonText}>Visit App</Text>
          </TouchableOpacity>
        </View>
      </View>

{addStoreLoc && (
  <View
    style={{
      position: "absolute",
      top: 20,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 220,
      backgroundColor: "white",
    }}
  >
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("slctAddShop", { location: "Zimbabwe" })
      }
      style={styles.buttonStyle}
    >
      <Text style={{ color: "#008000" }}> Zimbabwe</Text>
    </TouchableOpacity>

    <TouchableOpacity
      onPress={() =>
        navigation.navigate("slctAddShop", { location: "SouthAfrica" })
      }
      style={styles.buttonStyle}
    >
      <Text style={{ color: "#F7DC6F" }}> South Africa</Text>
    </TouchableOpacity>

    <TouchableOpacity
      onPress={() =>
        navigation.navigate("slctAddShop", { location: "Namibia" })
      }
      style={styles.buttonStyle}
    >
      <Text style={{ color: "#032B44" }}>Namibia</Text>
    </TouchableOpacity>

    <TouchableOpacity
      onPress={() =>
        navigation.navigate("slctAddShop", { location: "Tanzania" })
      }
      style={styles.buttonStyle}
    >
      <Text style={{ color: "#34C759" }}> Tanzania</Text>
    </TouchableOpacity>

    <TouchableOpacity
      onPress={() =>
        navigation.navigate("slctAddShop", { location: "Mozambique" })
      }
      style={styles.buttonStyle}
    >
      <Text style={{ color: "#008000" }}>Mozambique</Text>
    </TouchableOpacity>

    <TouchableOpacity
      onPress={() =>
        navigation.navigate("slctAddShop", { location: "Zambia" })
      }
      style={styles.buttonStyle}
    >
      <Text style={{ color: "#FFA07A" }}> Zambia</Text>
    </TouchableOpacity>

    <TouchableOpacity
      onPress={() =>
        navigation.navigate("slctAddShop", { location: "Botswana" })
      }
      style={styles.buttonStyle}
    >
      <Text style={{ color: "#468M2B4" }}>Botswana</Text>
    </TouchableOpacity>

    <TouchableOpacity
      onPress={() =>
        navigation.navigate("slctAddShop", { location: "Malawi" })
      }
      style={styles.buttonStyle}
    >
      <Text style={{ color: "#FFC080" }}>Malawi</Text>
    </TouchableOpacity>
  </View>
)}






<View style={{ flexDirection: "row" }}>
  <TouchableOpacity
    onPress={() => navigation.navigate("loadsContracts")}
    style={{
      marginBottom: 8,
      padding: 7,
      borderWidth: 2,
      borderColor: "#6a0c0c",
      borderRadius: 8,
      shadowColor: "#6a0c0c",
      shadowOffset: { width: 1, height: 2 },
      shadowOpacity: 0.7,
      shadowRadius: 5,
      overflow: "hidden",
      width: 283,
    }}
  >
    <Text
      style={{
        color: "#8B0000",
        fontWeight: "bold",
        fontSize: 24,
        marginBottom: 12,
      }}
    >
      Long-Term Contracts
    </Text>

    {/* Clickable Text for Long-term Contracts */}
    <Text
      style={{
        color: "#C62828",
        fontWeight: "600",
        fontSize: 16,
        textDecorationLine: "underline",
        marginBottom: 10,
      }}
    >
      Click Here for Logistics Contracts
    </Text>

    {/* Additional Information */}
    <Text
      style={{
        color: "black",
        fontWeight: "500",
        fontSize: 14,
        textAlign: "center",
        maxWidth: 300,
      }}
    >
      Click "Visit App" for immediate loads and trucks.
    </Text>
  </TouchableOpacity>

  <View style={{ margin: 7 }}>
    <Text style={{ color: "#1E90FF", fontWeight: "bold" }}>Add Now</Text>

    {!blockVerifiedU && !blackLWarning && username !== false && (
      <TouchableOpacity
        onPress={() => checkAuth("selectAddIterms")}
        style={{
          borderWidth: 1,
          borderColor: "red",
          zIndex: 200,
          borderRadius: 8,
          marginBottom: 7,
          marginTop: 7,
        }}
      >
        <Text
          style={{
            color: "red",
            fontSize: 12,
            fontWeight: "bold",
            alignSelf: "center",
          }}
        >
          Logistics
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-around",
          }}
        >
          <Text style={{ color: "red", fontSize: 12, fontWeight: "bold" }}>
            Add
          </Text>
          <MaterialIcons name="add-box" size={18} color="red" />
        </View>
      </TouchableOpacity>
    )}

    {!blockVerifiedU && !blackLWarning && username !== false && (
      <TouchableOpacity
        onPress={() => checkAuth("selectAddToShop")}
        style={{
          width: 70,
          height: 35,
          zIndex: 200,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: "green",
        }}
      >
        <Text
          style={{
            color: "green",
            fontSize: 12,
            fontWeight: "bold",
            alignSelf: "center",
          }}
        >
          Store
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-around",
          }}
        >
          <Text style={{ color: "green", fontSize: 12, fontWeight: "bold" }}>
            Add
          </Text>
          <MaterialIcons name="add-shopping-cart" size={18} color="green" />
        </View>
      </TouchableOpacity>
    )}
  </View>
</View>

<View style={{ flexDirection: "row" }}>
  <TouchableOpacity
    style={{
      marginBottom: 8,
      padding: 7,
      borderWidth: 2,
      borderColor: "#6a0c0c",
      borderRadius: 8,
      shadowColor: "#6a0c0c",
      shadowOffset: { width: 1, height: 2 },
      shadowOpacity: 0.7,
      shadowRadius: 5,
      overflow: "hidden",
      width: 283,
      height:138
    }}
    onPress={() => navigation.navigate("applyVerification")}
  >
    <MaterialIcons
      name="verified"
      size={120}
      color="rgba(34, 139, 34, 0.1)"
      style={{ alignSelf: "center" }}
    />

    <View style={{ position: "absolute", alignSelf: "center", zIndex: 14 }}>
      <Text
        style={{
          color: "#0B6623",
          fontWeight: "bold",
          fontSize: 24,
          marginBottom: 8,
        }}
      >
        first level verification
      </Text>
      <Text
        style={{
          color: "#1E8449",
          fontWeight: "600",
          fontSize: 16,
          textDecorationLine: "underline",
          marginBottom: 6,
        }}
      >
        We encourage all legit business to be verified
      </Text>
      <Text
        style={{
          color: "black",
          fontWeight: "500",
          fontSize: 14,
          textAlign: "center",
          maxWidth: 300,
        }}
      >
        Increase business trust and credibility by verifying your company.
      </Text>
    </View>
  </TouchableOpacity>

  <View style={{ margin: 7 }}>
    <Text style={{ color: "#1E90FF", fontWeight: "bold" }}>Find Fast</Text>

    <TouchableOpacity
      onPress={() => checkAuth("selectAddIterms")}
      style={{
        borderWidth: 1,
        borderColor: "red",
        zIndex: 200,
        borderRadius: 8,
        marginBottom: 7,
        marginTop: 7,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-around",
        }}
      >
        <Text style={{ color: "red", fontSize: 12, fontWeight: "bold" }}>
          Search
        </Text>
        <FontAwesome name="search" size={18} color="red" />
      </View>
      <Text
        style={{
          color: "red",
          fontSize: 12,
          fontWeight: "bold",
          alignSelf: "center",
        }}
      >
        Logistics
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      onPress={() => checkAuth("selectAddToShop")}
      style={{
        width: 70,
        height: 35,
        zIndex: 200,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "green",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-around",
        }}
      >
        <Text style={{ color: "green", fontSize: 12, fontWeight: "bold" }}>
          Search
        </Text>
        <FontAwesome name="search" size={18} color="green" />
      </View>
      <Text
        style={{
          color: "green",
          fontSize: 12,
          fontWeight: "bold",
          alignSelf: "center",
        }}
      >
        Transport
      </Text>
    </TouchableOpacity>
  </View>
</View>

<View style={{ flexDirection: "row" }}>
  <TouchableOpacity
    style={{
      marginTop: 7,
      borderWidth: 2,
      borderColor: "#0074D9",
      padding: 5,
      shadowColor: "rgba(0, 116, 217, 0.2)",
      shadowOffset: { width: 1, height: 2 },
      shadowOpacity: 0.7,
      shadowRadius: 5,
      overflow: "hidden",
      borderRadius: 8,
      width: 283,
      height:140
    }}
    onPress={() => navigation.navigate("applyGit")}
  >
    <FontAwesome6
      name="shield"
      size={120}
      color="rgba(0, 116, 217, 0.1)"
      style={{ alignSelf: "center" }}
    />
    <View style={{ position: "absolute", alignSelf: "center", zIndex: 14 }}>
      <Text
        style={{
          color: "#00509E",
          fontWeight: "bold",
          fontSize: 24,
          marginBottom: 8,
        }}
      >
        GIT (Goods in transit Insuarance)
      </Text>
      <Text
        style={{
          color: "#0074D9",
          fontWeight: "600",
          fontSize: 16,
          textDecorationLine: "underline",
          marginBottom: 6,
        }}
      >
        Click here to get GIT now
      </Text>
      <Text
        style={{
          color: "black",
          fontWeight: "500",
          fontSize: 14,
          textAlign: "center",
          maxWidth: 300,
        }}
      >
        Ensures financial protection for trucks and cargo, keeping your
        business secure.
      </Text>
    </View>
  </TouchableOpacity>

  <View style={{ margin: 7 }}>
    <Text style={{ color: "#1E90FF", fontWeight: "bold" }}>Logistics</Text>
    <TouchableOpacity
      onPress={() => checkAuth("selectAddIterms")}
      style={{
        borderWidth: 1,
        borderColor: "red",
        zIndex: 200,
        borderRadius: 8,
        marginBottom: 7,
        marginTop: 7,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <Text
        style={{ color: "red", fontSize: 17, fontWeight: "bold" }}
      >
        Loads
      </Text>
      <MaterialIcons
        name="forklift"
        size={26}
        color="red"
        style={{ alignSelf: "center" }}
      />
    </TouchableOpacity>

    <TouchableOpacity
      onPress={() => checkAuth("selectAddIterms")}
      style={{
        borderWidth: 1,
        borderColor: "red",
        zIndex: 200,
        borderRadius: 8,
        marginBottom: 7,
        marginTop: 7,
        flexDirection: "row",
      }}
    >
      <Text
        style={{ color: "red", fontSize: 17, fontWeight: "bold" }}
      >
        Trucks
      </Text>
      <FontAwesome5 name="truck" size={20} color="red" />
    </TouchableOpacity>
  </View>
</View>

<View style={{ flexDirection: "row" }}>
  <TouchableOpacity
    style={{
      marginTop: 7,
      borderWidth: 2,
      borderColor: "rgba(220, 20, 60)",
      padding: 5,
      shadowColor: "rgba(0, 116, 217, 0.2)",
      shadowOffset: { width: 1, height: 2 },
      shadowOpacity: 0.7,
      shadowRadius: 5,
      overflow: "hidden",
      borderRadius: 8,
      width: 283,
      height:138
    }}
    onPress={() => navigation.navigate("Events")}
  >
    <MaterialIcons
      name="event"
      size={129}
      color="rgba(220, 20, 60, 0.1)"
      style={{ alignSelf: "center" }}
    />
    <View style={{ position: "absolute", zIndex: 14, paddingLeft: 5 }}>
      <Text
        style={{
          color: "#B22222",
          fontWeight: "bold",
          fontSize: 24,
          marginBottom: 8,
        }}
      >
        T & L Events
      </Text>
      <Text
        style={{
          color: "#C71F37",
          fontWeight: "600",
          fontSize: 16,
          textDecorationLine: "underline",
          marginBottom: 6,
        }}
      >
        Get your tickets now for upcoming transport & logistics events!
      </Text>
      <Text
        style={{
          color: "black",
          fontWeight: "500",
          fontSize: 14,
          textAlign: "center",
          maxWidth: 300,
        }}
      >
        Featuring : burnouts, car shows, expos, conferences, and racing
        tournaments!
      </Text>
    </View>
  </TouchableOpacity>

  <View style={{ margin: 7 }}>
    <Text style={{ color: "#1E90FF", fontWeight: "bold" }}>Transport</Text>
    <TouchableOpacity
      onPress={() => checkAuth("selectAddToShop")}
      style={{
        width: 70,
        height: 35,
        zIndex: 200,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "green",
        marginBottom: 10,
      }}
    >
      <Text
        style={{
          color: "green",
          fontSize: 13,
          fontWeight: "bold",
        }}
      >
        clickto sell
      </Text>
      <MaterialIcons
        name="sell"
        size={18}
        color="green"
        style={{ alignSelf: "center" }}
      />
    </TouchableOpacity>

    <TouchableOpacity
      onPress={() => checkAuth("selectAddToShop")}
      style={{
        width: 70,
        height: 35,
        zIndex: 200,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "green",
      }}
    >
      <Text
        style={{
          color: "green",
          fontSize: 13,
          fontWeight: "bold",
        }}
      >
        click to buy
      </Text>
      <FontAwesome
        name="dollar"
        size={18}
        color="green"
        style={{ alignSelf: "center" }}
      />
    </TouchableOpacity>
  </View>
</View>


    </View>
  );
}

export default React.memo(FirsHomePage);

const styles = StyleSheet.create({
  title: {
    fontSize: 35,
    fontWeight: "900",
    color: "#6a0c0c",
    textTransform: "uppercase",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 2, height: 3 },
    textShadowRadius: 4,
    zIndex: 50,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#555",
    textAlign: "center",
    fontStyle: "italic",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    marginBottom: 17,
  },
  overlay: {
    position: "absolute",
    top: 20,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 220,
    backgroundColor: "white",
  },
  buttonStyle: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    width: 150,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: "#6a0c0c",
    borderRadius: 3,
  },
  locationText: {
    color: "#008000",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  greenButton: {
    height: 27,
    width: 130,
    borderRadius: 60,
    backgroundColor: "#228B22",
    justifyContent: "center",
    marginTop: 2,
  },
  redButton: {
    height: 27,
    width: 130,
    borderRadius: 60,
    backgroundColor: "red",
    justifyContent: "center",
    marginTop: 2,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
  },
  shadow: {
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 2, height: 3 },
    textShadowRadius: 4,
  },
});
