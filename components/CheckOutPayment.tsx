import React from 'react';
import { View,TouchableOpacity , Text,GestureResponderEvent  } from 'react-native';

interface CheckOutMakePaymentsProps {
  jsxProp: JSX.Element;
  anyProp: any;
 confirmButon: (event: GestureResponderEvent) => void;

}

    const CheckOutMakePayments: React.FC<CheckOutMakePaymentsProps> = ({ jsxProp, anyProp, confirmButon }) => {
  return (
    
              <View style={{position:'absolute',left:50 , right:50 ,height:500,top:100 , backgroundColor:"white",zIndex:300}} >
            <TouchableOpacity>
          <Text style={{ fontSize: 16, color: '#555' }} >Payment method</Text>

          </TouchableOpacity>
          <Text style={{fontSize:20 , fontWeight:'bold' ,alignSelf:'center'}}><Text style={{color:'#2457A0'}}>Eco</Text><Text style={{color:'#E22428'}}>Cash</Text> </Text>

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
  }}  >
    <Text style={{ color: 'white', fontWeight: '600' }}>Cancel</Text>
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
onPress={confirmButon}
>
  <Text style={{ color: 'black', fontWeight: '600' }}>Confirm</Text>
</TouchableOpacity>
</View>    





          


              </View>

  );
};

export default CheckOutMakePayments;

