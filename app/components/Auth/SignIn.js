import React from "react";

import { View , Text , TouchableOpacity ,TextInput , ActivityIndicator} from "react-native";
// import { signInWithEmailAndPassword , } from 'firebase/auth';
import { getAuth, signInWithEmailAndPassword ,sendEmailVerification} from 'firebase/auth';

import inputstyles from "../styles/inputElement"
import { useNavigation , useParams } from '@react-navigation/native';
function SignIn({navigation}){
  
  const navigate = useNavigation();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error , setError]= React.useState("")
  const [spinnerItem, setSpinnerItem] = React.useState(null);

  const auth = getAuth();

  const handleSignIn  = async () => {
    setSpinnerItem(true)
    try {
     const userCredential =  await signInWithEmailAndPassword(auth, email, password);

      const user = userCredential.user;
      await  
      sendEmailVerification(user); 
      setEmail("")
      setPassword("")

      Alert.alert('Verification Email Sent', 'Please Verify Your Email To Continue');
      navigation.navigate("Truckerz")
      setSpinnerItem(false)
    } catch (error) {
      setSpinnerItem(false)
      setError(error.message.toString());
    }
  };


return(
      <View style={{paddingTop : 100 , alignItems : 'center'}}>
       
      {error && <Text>{error}</Text>}
       
        <TextInput
          placeholder="Email"
          style={inputstyles.inputElem}
           onChangeText={(text) => setEmail(text)}
          />
          {spinnerItem && <ActivityIndicator/>}

        <TextInput
          placeholder="Password"
          type="password"
          onChangeText={(text) => setPassword(text)}
           style={inputstyles.inputElem}
        />

        <TouchableOpacity  onPress={handleSignIn}>
        <Text  style={{textDecorationLine : 'underline', fontSize : 17}}>Sign In</Text>
        </TouchableOpacity>

    </View>
)
}
export default React.memo(SignIn)