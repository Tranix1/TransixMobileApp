import React from "react";

import { View , Text , TouchableOpacity ,TextInput , ActivityIndicator} from "react-native";
// import { signInWithEmailAndPassword , } from 'firebase/auth';
import { getAuth, signInWithEmailAndPassword ,sendEmailVerification,sendPasswordResetEmail} from 'firebase/auth';

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

      alert('Verification Email Sent', 'Please Verify Your Email To Continue');
      navigation.navigate("Truckerz")
      setSpinnerItem(false)
    } catch (error) {
      setSpinnerItem(false)
      setError(error.message.toString());
    }
  };

const sendPasswordReset = () => {
  if(email){

  sendPasswordResetEmail(auth, email)
    .then(() => {
      // Password reset email sent successfully
      alert('Password reset email sent');
    })
    .catch((error) => {
      // An error occurred
      setError('Error sending password reset email',  error.message.toString());
    });
  }else{
    alert("Enter Email that need to be reset")
  }
};

return(
      <View style={{paddingTop : 100 , alignItems : 'center'}}>
       
      {error && <Text>{error}</Text>}
      

        <TouchableOpacity onPress={sendPasswordReset} >
          <Text  style={{textDecorationLine : 'underline', fontSize : 15}} >Forgot Password</Text>
        </TouchableOpacity>

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

        <TouchableOpacity  onPress={handleSignIn} style={{backgroundColor : '#6a0c0c' , width : 80 , height : 35 , borderRadius: 5 , alignItems : 'center' , justifyContent : 'center' , marginBottom : 10}} >
        <Text  style={{color:'white'}}>Sign In</Text>
        </TouchableOpacity>

    </View>
)
}
export default React.memo(SignIn)