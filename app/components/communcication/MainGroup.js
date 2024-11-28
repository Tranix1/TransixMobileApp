import React ,{useState, useEffect} from "react";
import { View , Text , TouchableOpacity , ScrollView , Image , TextInput , Keyboard} from "react-native";
import { getDownloadURL, ref, uploadBytes, uploadBytesResumable ,} from "firebase/storage";
import {addDoc , onSnapshot , orderBy , query , serverTimestamp , collection, } from "firebase/firestore"
import { db , auth} from "../config/fireBase";

import { storage } from "../config/fireBase";

import * as ImagePicker from 'expo-image-picker';
import Fontisto from '@expo/vector-icons/Fontisto';
import { Ionicons } from "@expo/vector-icons";

function MainGroup({route}){
const {username} = route.params
  const [message , setMessages]=React.useState([])

  const mainGroupDB = collection(db, "MainGroupChats");

React.useEffect(() => {
  try {
    const q = query(mainGroupDB, orderBy('timestamp'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messages = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setMessages(messages);
    });

    return unsubscribe; // Return the unsubscribe function
  } catch (error) {
    console.error('Error fetching messages:', error);
  }


}, []);

 const [currentTime, setCurrentTime] = useState(formatTime(new Date()));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(formatTime(new Date()));
    }, 1000); // Update every minute

    // Clear the interval when the component unmounts
    return () => clearInterval(interval);
  }, []); // Empty dependency array to run the effect only once

  function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }


const [currentDateTime, setCurrentDateTime] = useState(formatDateTime(new Date()));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(formatDateTime(new Date()));
    }, 5000); // Update every 5 seconds

    // Clear the interval when the component unmounts
    return () => clearInterval(interval);
  }, []); // Empty dependency array to run the effect only once

  function formatDateTime(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }

    const [previousDateTime, setPreviousDateTime] = useState(formatDateTime(getPreviousDate()));
  
  useEffect(() => {
    const interval = setInterval(() => {
      setPreviousDateTime(formatDateTime(getPreviousDate()));
    }, 5000); // Update every 5 seconds

    // Clear the interval when the component unmounts
    return () => clearInterval(interval);
  }, []); // Empty dependency array to run the effect only once

  function formatDateTime(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }

  function getPreviousDate() {
    const currentDate = new Date();
    const previousDate = new Date(currentDate);
    previousDate.setDate(currentDate.getDate() - 1);
    return previousDate;
  }




 const [image, setImage] = useState(null);
     const selectImage = async () => {
    let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert('Permission to access camera roll is required!');
      return;
    }

    let pickerResult = await ImagePicker.launchImageLibraryAsync();
    
    if (pickerResult.cancelled === true) {
      return;
    }

    // Check if assets array exists and has at least one element
    if (pickerResult.assets && pickerResult.assets.length > 0) {
      const firstAsset = pickerResult.assets[0];
      if (firstAsset.uri) {
        setImage({ localUri: firstAsset.uri });
        uploadImage(firstAsset); // Call uploadImage with the selected asset
      } else {
        alert('Selected image URI is undefined');
      }
    } else {
      alert('No assets found in the picker result');
    }
  };

const [storagePath, setStoragePath] = React.useState('');
const [downloadURL, setDownloadURL] = React.useState('')

async function uploadImage(asset) {  
const response = await fetch(asset.uri);
const blob = await response.blob();
const storageRef = ref(storage, `Trucks/` + new Date().getTime() );
const path = `Stuff/${new Date().getTime()}`;
const uploadTask = uploadBytesResumable(storageRef, blob);

return new Promise((resolve, reject) => {
  // Listen for events
  uploadTask.on(
    'state_changed',
    (snapshot) => {
      // Progress handling
    },
    (error) => {
      // Error handling
      reject(error);
    },
    () => {
      getDownloadURL(uploadTask.snapshot.ref)
        .then((downloadURL) => {
           setDownloadURL(downloadURL)
          resolve(downloadURL);
        })
        .catch((error) => {
          reject(error);
        });
    }
    );
});
}


let imageUrl

 const mainGroup = collection(db ,'MainGroupChats');

const [typedMsg , setTypedMsg] = React.useState('')

const handleSubmit = async (event) => {

       if(image){
          imageUrl = downloadURL
        }else{
          imageUrl = null
        }


  try {
    await addDoc(mainGroup, {
      typedMsg: typedMsg,
      username: username,
      userId: auth.currentUser.uid,
      currentDate: currentDateTime,
      currentTime: currentTime,
      timestamp: serverTimestamp(),
      // addedImage: imageUrl,
      isViewed: false, // Set the initial value to indicate the message is not viewed
      addedImage: imageUrl 
    });
  } catch (err) {
    console.error(err);
  }
  // Reset form fields
  setTypedMsg('')
  setImage(null)
  // setDownloadURL(null);
};




 let previousDate = null;
 const dspMessages =   message.map((item) => {
     let messageDate = item.currentDate;
          const showMessageDate = previousDate !== messageDate;
          previousDate = messageDate;
          
          if (messageDate === currentDateTime) {
                messageDate = 'today';
              } else if (messageDate === previousDateTime) {
                messageDate = 'yesterday';
              }

      if (item.userId === auth.currentUser.uid) {
        return (<View key={item.id}>
            {showMessageDate && <Text>{messageDate}</Text>}
            <View style={{padding: 7,marginBottom: 2,backgroundColor: 'rgb(129,201,149)',marginLeft: 70,}}>
              <Text style={{ color: '#6a0c0c' }}>{item.username}</Text>
              {item.addedImage && (
                     <Image
                  source={{ uri: item.addedImage }}
                  style={{ width: '100%', height: 200, resizeMode: 'cover', marginBottom: 10 }}
                />
              )}
              <Text>{item.typedMsg}</Text>
              <Text style={{ fontSize: 12, position: 'absolute', right: 8, bottom: 0 }}>
                {item.currentTime}
              </Text>
            </View>
          </View>
        );
      } else {
        return (
          <View key={item.id}>
            {showMessageDate && <Text>{messageDate}</Text>}
            <View style={{padding: 7,marginBottom: 6,backgroundColor: 'white',marginRight: 80,}}>
              {item.addedImage && (
                     <Image
                  source={{ uri: item.addedImage }}
                  style={{ width: '100%', height: 200, resizeMode: 'cover', marginBottom: 10 }}
                />
              )}
              <Text style={{ fontSize: 15, color: '#6a0c0c' }}>{item.username}</Text>
              <Text>{item.typedMsg}</Text>
              <Text style={{ fontSize: 12, position: 'absolute', right: 8, bottom: 0 }}>
                {item.currentTime}
              </Text>
            </View>
          </View>
        );
      }
    })


              const [keyboardHeight, setKeyboardHeight] = useState(0);
              useEffect(() => {

              const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
                setKeyboardHeight(0); // Reset keyboard height
              });

              return () => {
                // keyboardDidShowListener.remove();
                keyboardDidHideListener.remove();
              };
              }, []); // Empty dependency array to run effect only once

const scrollViewRef = React.useRef();
    return(
<View style={{ position : 'absolute' ,bottom : 0 , top : 0 , width:390 , }}>



    <ScrollView      style={{ flex: 1, paddingBottom: 10, paddingLeft: 7, paddingRight: 7, paddingTop: 20, marginBottom: 80 }}
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={(contentWidth, contentHeight) => {
                scrollViewRef.current.scrollToEnd({ animated: true });
            }}
            ref={scrollViewRef}
            >
      {dspMessages}
    </ScrollView>
     { image &&<View style={{position:'absolute' , top :70 ,left : 1,  right : 1 , bottom :50   , alignItems :'center' , justifyContent : 'center' , backgroundColor : 'rgba(0, 0, 0, 0.7)'}} >
      <Image source={{ uri: image.localUri }} style={{ width: 200, height: 200 }} />

        </View>}

  <View>

  <View style={{ position: 'absolute', bottom: keyboardHeight, left: 0, right: 0 , flexDirection : 'row' , backgroundColor : '#e8e6e3' , height : 45 , justifyContent:'flex-end'}}>
    <View style={{paddingLeft : 17 , maxHeight : 40, borderColor: 'black', borderWidth: 2, borderRadius: 20, flex: 1 , flexDirection:'row', paddingRight:5}}> 
  <TextInput
    style={{flex:1}}
    placeholderTextColor="#6a0c0c"
    placeholder="Type your message"
    type="text"
    value={typedMsg}
    onChangeText={(text) => setTypedMsg(text)}
    multiline={true}
  />

   {!image && <TouchableOpacity onPress={selectImage} style={{marginBottom : 9 , alignItems : 'center' , justifyContent : 'center'}}>
          <Fontisto name="camera" size={25} color="#6a0c0c" />
     </TouchableOpacity>}
    
    </View>

     <TouchableOpacity onPress={handleSubmit} style={{ width : 50 , backgroundColor : '#9d1e1e', borderRadius : 6  ,  alignItems : 'center' , justifyContent: 'center' , height : 35, marginLeft : 4 , marginRight : 6}}  >
      <Ionicons name="send" size={25} color="white" />

    </TouchableOpacity>
   
  </View>
  </View>
</View>
)

}
export default React.memo(MainGroup)