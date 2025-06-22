import React from 'react';
import { View,TouchableOpacity , GestureResponderEvent,Modal,  } from 'react-native';
import ScreenWrapper from './ScreenWrapper';
import { ThemedText } from './ThemedText';
import Input from './Input';


interface CheckOutMakePaymentsProps {
  jsxProp: JSX.Element;
 confirmButon: (event: GestureResponderEvent) => void;
 cancelBTN: (event: GestureResponderEvent) => void;

}


    const CheckOutMakePayments: React.FC<CheckOutMakePaymentsProps> = ({ jsxProp, confirmButon,cancelBTN,}) => {
      const [paymentMethod , setPaymentMethod]=React.useState("")
      const [dspPaymentInputs , setDspPaymmentInout]=React.useState(false)






  return (
      <Modal>

              <ScreenWrapper  >

             { (!dspPaymentInputs || !paymentMethod) &&   <View>

          <ThemedText style={{ fontSize: 16,  }} >Payment method</ThemedText>

    <TouchableOpacity onPress={()=>setPaymentMethod("International")} >
      <ThemedText>MasterCard/VISA </ThemedText>
    </TouchableOpacity>

    <TouchableOpacity onPress={()=>setPaymentMethod("ecocash")}>
          <ThemedText style={{fontSize:20 , fontWeight:'bold' }}><ThemedText style={{color:'#2457A0'}}>Eco</ThemedText><ThemedText style={{color:'#E22428'}}>Cash</ThemedText> </ThemedText>
    </TouchableOpacity>

             <View>
                {jsxProp}

                </View>   


                <View style={{ flexDirection: "row", justifyContent:"space-evenly" , gap: 10 ,marginTop:10}}>
  <TouchableOpacity style={{
    // flex: 1,
    height: 40,
    backgroundColor: 'black',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    width:110
  }} onPress={cancelBTN} >
    <ThemedText style={{ color: 'white', fontWeight: '600' }}>Cancel</ThemedText>
  </TouchableOpacity>

<TouchableOpacity style={{
  height: 40,
  backgroundColor: 'white',
  borderRadius: 12,
  justifyContent: 'center',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: '#D3D3D3',
  width: 110,

  // 💡 Shadow for iOS
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 6,

  // 💡 Elevation for Android
  elevation: 3,
}}
onPress={()=>setDspPaymmentInout(true) }
>
  <ThemedText style={{ color: 'black', fontWeight: '600' }}>Confirm</ThemedText>
</TouchableOpacity>
</View>    

                </View>}


{ dspPaymentInputs && paymentMethod &&  <View>
 {dspPaymentInputs && paymentMethod==="ecocash" && <View>
    <Input placeholder='Phone Number' />
  </View>}

 {dspPaymentInputs &&paymentMethod==="International" && <View>
    <ThemedText>Card Details</ThemedText>
    <Input placeholder='Name on Card' />
    <Input placeholder='Card Number'/>
    <Input placeholder='MM/YY'/>
    <Input placeholder='CVV' />

  </View>}
  <TouchableOpacity style={{width:300 , height:40 , backgroundColor:"green" , borderRadius:5 ,alignSelf:"center"}} >
    <ThemedText style={{alignSelf:"center"}}>Pay and Add Contract</ThemedText>
  </TouchableOpacity>

  <TouchableOpacity onPress={cancelBTN}>
    <ThemedText>Back</ThemedText>
  </TouchableOpacity>

 </View>}


              </ScreenWrapper>
      </Modal>

  );
};

export default CheckOutMakePayments;

