import React ,{useState, useEffect} from "react";
import { View , Text , TouchableOpacity , ScrollView , Image , TextInput , Keyboard} from "react-native";
import {addDoc , onSnapshot , orderBy , query ,doc , serverTimestamp , getDocs,collection,where } from "firebase/firestore"
import { db  , auth} from "../config/fireBase";
import { storage } from "../config/fireBase";
import { getDownloadURL, ref, uploadBytes, uploadBytesResumable ,} from "firebase/storage";

import * as ImagePicker from 'expo-image-picker';
// import { Ionicons } from "@expo/vector-icons";
import Fontisto from '@expo/vector-icons/Fontisto';
import { Ionicons } from "@expo/vector-icons";


function Messaging ({route, navigation}){
  
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


    let {chatStarterId ,starterCompanyName , gchatId  , senderName , receiverName , username}  = route.params

      let chatId = gchatId
  console.log(chatId ,"chatud")
      const contactId = chatStarterId
      
      useEffect(() => {
  const userId = auth.currentUser.uid



  let chatRef 
  if(chatId ){

    chatRef = doc(db, "Chats", chatId);
    console.log("panashe")
  }else  {
    let chatId = `${userId}${contactId}`; 
    chatRef = doc(db, "Chats", chatId);
  }
  console.log(chatRef , "yayaya" )
  const messagesQuery = query(
    collection(chatRef, "messages"),
    orderBy("timestamp", "desc")
    );
    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messageList = [];
      snapshot.forEach((doc) => {
        messageList.push(doc.data());
      });
      setMessages(messageList.reverse());
    });
    
    return () => unsubscribe(); // Cleanup the listener when the component unmounts
}, [ contactId ]);


 const ppleInTouch = collection(db ,'ppleInTouch');

const checkExistingChat = async (chatId) => {
const chatsRef = collection(db, 'ppleInTouch'); // Reference to the 'ppleInTouch' collection
const chatQuery = query(chatsRef, where('chatId', '==', chatId)); // Query for matching chat ID

    const querySnapshot = await getDocs(chatQuery);  
    // Check if any documents exist with the chat ID
    return !querySnapshot.empty; // Returns true if a document exists, false otherwise
  };

const [messages, setMessages] = useState([]);
const [message, setMessage] = useState("");
 

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

const handleSubmit = async () => {
    if(image){
          imageUrl = downloadURL
        }else{
          imageUrl = null
        }
  

 let addChatId 

 
 const userId = auth.currentUser.uid
 try {
  
    if(!chatId){
    const chatId = `${userId}${contactId}` ;
    const chatRef = doc(db, "Chats", chatId);
  await addDoc(collection(chatRef, "messages"), {
    message: message,
    msgSenderId : userId,
    senderName : username ,
    receiverName : starterCompanyName ,
    msgReceiverId: contactId ,
    chatId : chatId ,
    timestamp : serverTimestamp() ,
    currentDate: currentDateTime,
    currentTime: currentTime,
    addedImage: imageUrl, 
    
  });  
  addChatId = chatId
}else{
  const chatId = chatId
  const chatRef = doc(db, "Chats", chatId);
  await addDoc(collection(chatRef, "messages"), {
    message: message,
    senderName : username ,
    receiverName : senderName ,
    chatId : chatId ,
    timestamp : serverTimestamp() ,
    currentDate: currentDateTime,
    currentTime: currentTime,
    addedImage: imageUrl, 
    
  });  
  addChatId = chatId
}

const existingChat = await checkExistingChat(addChatId);

if (!existingChat) {
  // Chat doesn't exist, add it to 'ppleInTouch'
  await addDoc(ppleInTouch, {
    msgSenderId : userId,
    msgReceiverId: contactId,
    receiverName : starterCompanyName  ,
    senderName  : username  ,
    chatId : addChatId,
    timestamp : serverTimestamp() ,
  });
}
  setMessage("");
} catch (err) {
  console.error(err);
}
};

        let previousDate = null;
        let dspMessages = messages.map((item, index) => {
          let messageDate = item.currentDate;
          const showMessageDate = previousDate !== messageDate;
          previousDate = messageDate;

          if (messageDate === currentDateTime) {
                messageDate = 'today';
              } else if (messageDate === previousDateTime) {
                messageDate = 'yesterday';
              }

         const userId = auth.currentUser.uid
          if (item.msgReceiverId === userId) {
            return (
            <View key={item.id}>
            {showMessageDate && <Text>{messageDate}</Text>}
            <View style={{marginBottom: 2,backgroundColor: 'lightGay',marginLeft: 70,justifyContent:'center' ,paddingLeft:5 ,paddingBottom: 6 ,paddingTop:7}}>

              {item.addedImage && (
                     <Image
                  source={{ uri: item.addedImage }}
                  style={{ width: '100%', height: 200, resizeMode: 'cover', marginBottom: 10 }}
                />
              )}
              <Text style={{color:'white'}} >{item.message}</Text>
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
            <View style={{marginBottom: 2,backgroundColor: 'rgb(129,201,149)',marginLeft: 70,justifyContent:'center' ,paddingLeft:5 ,paddingBottom: 6 ,paddingTop:7}}>

              {item.addedImage && (
                     <Image
                  source={{ uri: item.addedImage }}
                  style={{ width: '100%', height: 200, resizeMode: 'cover', marginBottom: 10 }}
                />
              )}
              <Text style={{color:'white'}} >{item.message}</Text>
              <Text style={{ fontSize: 12, position: 'absolute', right: 8, bottom: 0 }}>
                {item.currentTime}
                
              </Text>
            </View>
          </View>
            );
          }
        });

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
return (<View style={{  flex: 1 , paddingBottom : 16 }}>
        <View  style={{flexDirection : 'row' , height : 84  ,  paddingLeft : 6 , paddingRight: 15 , paddingTop:10 ,backgroundColor : '#6a0c0c' ,paddingTop : 15 , alignItems : 'center'}} >
                <TouchableOpacity style={{marginRight: 10}} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={30} color="white"style={{ marginLeft: 10 }}  />

        </TouchableOpacity>
        <Text style={{fontSize: 20 , color : 'white'}} >{starterCompanyName}  </Text>
       </View>


    <ScrollView      style={{ flex: 1, paddingBottom: 0, paddingLeft: 7, paddingRight: 7, paddingTop: 20, marginBottom: 50 }}
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
  <View style={{ position: 'absolute', bottom: keyboardHeight, left: 0, right: 0 , flexDirection : 'row' , backgroundColor : '#e8e6e3' , height : 45 , }}>
    <View style={{paddingLeft : 17 , maxHeight : 40, borderColor: 'black', borderWidth: 2, borderRadius: 20, flex: 1 , flexDirection:'row', paddingRight:5}}> 
  <TextInput
    style={{flex:1 , }}
    placeholderTextColor="#6a0c0c"
    placeholder="Type your message"
    type="text"
    value={message  }
    onChangeText={(text) => setMessage(text)}
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
</View>);

}
export default React.memo(Messaging)
