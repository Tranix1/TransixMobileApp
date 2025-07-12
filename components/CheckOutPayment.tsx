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
import Divider from "@/components/Divider";

interface CheckOutMakePaymentsProps {
  jsxProp: JSX.Element;
 confirmButon: (event: GestureResponderEvent) => void;
 cancelBTN: (event: GestureResponderEvent) => void;

}


    const CheckOutMakePayments: React.FC<CheckOutMakePaymentsProps> = ({ jsxProp, confirmButon,cancelBTN,}) => {

            const icon = useThemeColor('icon') // <-- ADD THIS LINE

    const backgroundLight = useThemeColor('backgroundLight')
    const background = useThemeColor('background')

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
      
    }}
  >
    Payment Method
  </ThemedText>
     <TouchableOpacity onPress={cancelBTN} >
                  <Ionicons name="close" size={wp(7)} color={icon} />
                </TouchableOpacity>
        </View>

        

  <TouchableOpacity
    onPress={() => setPaymentMethod("International")}
    style={{
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: paymentMethod === "International" ? background : backgroundLight ,
      paddingVertical: 15,
      paddingHorizontal: 10,
      borderRadius: 10,
      marginBottom: 10,
      borderWidth:1,
      borderColor :paymentMethod === "International" ? icon : backgroundLight,
    }}
  >
    <ThemedText style={{ fontSize: 16,  }}>
      Debit or Credit Card
    </ThemedText>

    {paymentMethod === "International" ? (
      <FontAwesome6 name="dot-circle" size={24} color={icon} />
    ) : (
      <FontAwesome name="circle-thin" size={24} color={icon} />
    )}
  </TouchableOpacity>

  <TouchableOpacity
    onPress={() => setPaymentMethod("ecocash")}
    style={{
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: paymentMethod === "ecocash" ? background : backgroundLight,
      paddingVertical: 15,
      paddingHorizontal: 10,
      borderRadius: 10,
      marginBottom: 20,
      borderWidth:1,
      borderColor :paymentMethod === "ecocash" ? icon : backgroundLight,
    }}
  >
    <ThemedText style={{ fontSize: 16,  }}>
      EcoCash
    </ThemedText>

    {paymentMethod === "ecocash" ? (
      <FontAwesome6 name="dot-circle" size={24} color={icon} />
    ) : (
      <FontAwesome name="circle-thin" size={24} color={icon} />
    )}
  </TouchableOpacity>

  {/* Extra Pricing Items */}

    {jsxProp}

  {/* Secure Note */}
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 10,
    }}
  >
    <Entypo name="lock" size={20}  style={{ marginRight: 8 }} />
    <ThemedText style={{  fontSize: 14 }}>
      Your payments are made securely
    </ThemedText>
  </View>
</View>





  

<TouchableOpacity style={[styles.confirmBTN , {backgroundColor:"#424242"}]}
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

                        <Divider />
<TouchableOpacity
  style={[styles.confirmBTN , {backgroundColor:"#424242"}]}
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