import React from 'react';
import { View,TouchableOpacity , GestureResponderEvent,Modal,StyleSheet  } from 'react-native';
import ScreenWrapper from './ScreenWrapper';
import { ThemedText } from './ThemedText';
import Input from './Input';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Entypo from '@expo/vector-icons/Entypo';
import {  Ionicons } from '@expo/vector-icons'
import { hp, wp } from '@/constants/common'
import { useThemeColor } from '@/hooks/useThemeColor'

interface CheckOutMakePaymentsProps {
  jsxProp: JSX.Element;
 confirmButon: (event: GestureResponderEvent) => void;
 cancelBTN: (event: GestureResponderEvent) => void;

}


    const CheckOutMakePayments: React.FC<CheckOutMakePaymentsProps> = ({ jsxProp, confirmButon,cancelBTN,}) => {

            const icon = useThemeColor('icon') // <-- ADD THIS LINE

      const [paymentMethod , setPaymentMethod]=React.useState("")
      const [dspPaymentInputs , setDspPaymmentInout]=React.useState(false)






  return (
      <Modal>

              <ScreenWrapper  >

             { (!dspPaymentInputs || !paymentMethod) &&   <View>

      <View style={{ marginVertical: 20, paddingHorizontal: 15 }}>
        <View style={{flexDirection:"row",justifyContent:"space-between",marginBottom: 15,alignItems:"center"}}>

  <ThemedText
    style={{
      fontSize: 20,
      fontWeight: 'bold',
      
      color: 'white',
    }}
  >
    Payment Method
  </ThemedText>
     <TouchableOpacity onPress={()=>{cancelBTN}} >
                  <Ionicons name="close" size={wp(7)} color={icon} />
                </TouchableOpacity>
        </View>

        

  <TouchableOpacity
    onPress={() => setPaymentMethod("International")}
    style={{
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: paymentMethod === "International" ? '#444' : '#222',
      paddingVertical: 15,
      paddingHorizontal: 10,
      borderRadius: 10,
      marginBottom: 10,
    }}
  >
    <ThemedText style={{ fontSize: 16, color: 'white' }}>
      Debit or Credit Card
    </ThemedText>

    {paymentMethod === "International" ? (
      <FontAwesome6 name="dot-circle" size={24} color="white" />
    ) : (
      <FontAwesome name="circle-thin" size={24} color="white" />
    )}
  </TouchableOpacity>

  <TouchableOpacity
    onPress={() => setPaymentMethod("ecocash")}
    style={{
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: paymentMethod === "ecocash" ? '#444' : '#222',
      paddingVertical: 15,
      paddingHorizontal: 10,
      borderRadius: 10,
      marginBottom: 20,
    }}
  >
    <ThemedText style={{ fontSize: 16, color: 'white' }}>
      EcoCash
    </ThemedText>

    {paymentMethod === "ecocash" ? (
      <FontAwesome6 name="dot-circle" size={24} color="white" />
    ) : (
      <FontAwesome name="circle-thin" size={24} color="white" />
    )}
  </TouchableOpacity>

  {/* Extra Pricing Items */}

<View
  style={{
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  }}
>
  <ThemedText
    style={{
      color: 'white',
      fontSize: 16,
      marginBottom: 10,
      fontWeight: 'bold',
    }}
  >
    Platform Fees
  </ThemedText>

  <View
    style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    }}
  >
    <ThemedText style={{ color: 'white', fontSize: 14 }}>
      Add Contract
    </ThemedText>
    <ThemedText
      style={{ color: '#4CAF50', fontSize: 14, fontWeight: 'bold' }}
    >
      $5
    </ThemedText>
  </View>

  <View
    style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    }}
  >
    <ThemedText style={{ color: 'white', fontSize: 14 }}>
      Add Load
    </ThemedText>
    <ThemedText
      style={{ color: '#4CAF50', fontSize: 14, fontWeight: 'bold' }}
    >
      $2
    </ThemedText>
  </View>

  <View
    style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
    }}
  >
    <ThemedText style={{ color: 'white', fontSize: 14 }}>
      Add Truck
    </ThemedText>
    <ThemedText
      style={{ color: '#4CAF50', fontSize: 14, fontWeight: 'bold' }}
    >
      $8
    </ThemedText>
  </View>

  <View
    style={{
      borderTopWidth: 1,
      borderTopColor: '#555',
      paddingTop: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
    }}
  >
    <ThemedText style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
      Total
    </ThemedText>
    <ThemedText
      style={{ color: '#4CAF50', fontSize: 16, fontWeight: 'bold' }}
    >
      $15
    </ThemedText>
  </View>
</View>



  {/* Secure Note */}
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 10,
    }}
  >
    <Entypo name="lock" size={20} color="white" style={{ marginRight: 8 }} />
    <ThemedText style={{ color: 'white', fontSize: 14 }}>
      Your payments are made securely
    </ThemedText>
  </View>
</View>





  

<TouchableOpacity style={[styles.confirmBTN , {backgroundColor:"#00897B"}]}
onPress={()=>setDspPaymmentInout(true) }
>
  <ThemedText style={styles.confrirmText}>Confirm</ThemedText>
</TouchableOpacity>

                </View>}


{ dspPaymentInputs && paymentMethod &&  <View>
 {dspPaymentInputs && paymentMethod==="ecocash" && <View>


 <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                margin: wp(4)
              }}>
    <ThemedText>Phone Number</ThemedText>
                <TouchableOpacity onPress={()=>{setPaymentMethod(""); setDspPaymmentInout(false)}} >
                  <Ionicons name="close" size={wp(5)} color={icon} />
                </TouchableOpacity>
              </View>



    <Input placeholder='Phone Number' />
  </View>}

 {dspPaymentInputs &&paymentMethod==="International" && <View>
     <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                margin: wp(4)
              }}>
    <ThemedText>Card Details </ThemedText>
                <TouchableOpacity onPress={()=>{setPaymentMethod(""); setDspPaymmentInout(false)}} >
                  <Ionicons name="close" size={wp(5)} color={icon} />
                </TouchableOpacity>
              </View>
    <Input placeholder='Name on Card' />
    <Input placeholder='Card Number'/>
    <Input placeholder='MM/YY'/>
    <Input placeholder='CVV' />

  </View>}

<TouchableOpacity
  style={[styles.confirmBTN , {backgroundColor:"black"}]}
>
  <ThemedText
    style={styles.confrirmText}
  >
    Pay and Add Contract
  </ThemedText>
</TouchableOpacity>

 

 </View>}


              </ScreenWrapper>
      </Modal>

  );
};

export default CheckOutMakePayments;



const styles = StyleSheet.create({
  confirmBTN :{
  width: 320,
    height: 50,
    // backgroundColor: "#28a745", // a nicer green shade
    borderRadius: 8,
    alignSelf: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5, // for Android shadow
    marginVertical: 10, // spacing from other components
  },
  confrirmText :{
      color: "white",
      fontSize: 16,
      fontWeight: "bold",
      textAlign: "center",

  }
})