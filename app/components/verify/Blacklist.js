import React,{useEffect} from "react";
import { View , Text , ScrollView , TouchableOpacity} from 'react-native';

import { auth, db,  } from "../config/fireBase";
import {onSnapshot , collection,  } from "firebase/firestore"

function Blacklist(){



  const updatesDB= collection(db, "blacklist");

  const [updates , setUpdates]=React.useState([])

  useEffect(() => {
    const unsubscribe = onSnapshot(updatesDB, (querySnapshot) => {
      let filteredData = [];

      querySnapshot.forEach((doc) => {
        filteredData.push({
          id: doc.id,
          ...doc.data()
        });
      });
     
          filteredData = filteredData.sort((a, b) => b.timeStamp - a.timeStamp);

      setUpdates(filteredData);
    });

    return () => {
      unsubscribe(); // Unsubscribe the listener when the component unmounts
    };
  }, []); 


const [dspAllImages , setDspAllImages]= React.useState({ ['']: false });

function displayAllImages(itemId){
  setDspAllImages((prevState) => ({
        ...prevState,
        [itemId]: !prevState[itemId],
      })
  );
}



const rendereIterms = updates.map((item)=>{ 

           let ImageDsp 
           
            if(item.imageUrl[2]  ){
                  ImageDsp = ( <View style={{flexDirection:'row'}}>
                  {imageLoading[item.id] && <Text style={{ position :'absolute' , top:0 , left :0, backgroundColor:'white'}}  >Quality Images Loading...</Text> }
         <View style={{flex:1  , height : 250}} >
              <Image
                source={{ uri: item.imageUrl[0] }}
                style={{ height: 250, borderRadius: 10,  resizeMode: 'cover' }}
                // resizeMode={'contain'}
                onLoadStart={() =>imagaLoadingF(item.id)}
                onLoadEnd={() =>imagaLoadingF(item.id)}
                onError={(error) => console.log('Image error:', error.nativeEvent.error)}
              />
           </View>
            
             <View style={{flex :1,height :250}} >
              <Image
                source={{ uri: item.imageUrl[1] }}
                style={{ height: 125, borderRadius: 10,  resizeMode: 'cover' }}
                // resizeMode={'contain'}
                onLoadStart={() =>setImageLoading( { ['']: true })}
                onLoadEnd={() =>imagaLoadingF(item.id)}
                onError={(error) => console.log('Image error:', error.nativeEvent.error)}
              />
               <Image
                source={{ uri: item.imageUrl[2] }}
                style={{ height: 125, borderRadius: 10,  resizeMode: 'cover' }}
                // resizeMode={'contain'}
                onLoadStart={() =>imagaLoadingF(item.id)}
                onLoadEnd={() =>imagaLoadingF(item.id)}
                onError={(error) => console.log('Image error:', error.nativeEvent.error)}
                /> 
            </View>      
        </View>    

          )

        }else if( item.imageUrl[1]  ){

        ImageDsp= (<View style={{flexDirection:'row'}} >
                  {imageLoading[item.id] && <Text style={{ position :'absolute' , top:0 , left :0,backgroundColor:'white'}}  >Quality Images Loading...</Text> }
               <View style={{flex:1  , height : 250}} >
              <Image
                source={{ uri: item.imageUrl[0] }}
                style={{ height: 250, borderRadius: 10,  resizeMode: 'cover' }}
                // resizeMode={'contain'}
                onLoadStart={() =>imagaLoadingF(item.id)}
                onLoadEnd={() =>imagaLoadingF(item.id)}
                onError={(error) => console.log('Image error:', error.nativeEvent.error)}
              />
           </View>

                <View style={{flex:1  , height : 250}} >
              <Image
                source={{ uri: item.imageUrl[1] }}
                style={{ height: 250, borderRadius: 10,  resizeMode: 'cover' }}
                // resizeMode={'contain'}
                onLoadStart={() =>imagaLoadingF(item.id)}
                onLoadEnd={() =>imagaLoadingF(item.id)}
                onError={(error) => console.log('Image error:', error.nativeEvent.error)}
              />
           </View>
        </View>

          )
        }else if( item.imageUrl[0] ) {

          ImageDsp = ( <View>  
           {imageLoading[item.id] && <Text style={{ position :'absolute' , top:0 , left :0,backgroundColor:'white'}}  >Quality Images Loading...</Text> }
            <Image
                source={{ uri: item.imageUrl[0] }}
                style={{ height: 250, borderRadius: 10,  resizeMode: 'cover' }}
                // resizeMode={'contain'}
                onLoadStart={() =>imagaLoadingF(item.id)}
                onLoadEnd={() =>imagaLoadingF(item.id)}
                onError={(error) => console.log('Image error:', error.nativeEvent.error)}
                /> 
              </View> 
                
                )
        }
return (

        <View>
              {dspAllImages[item.id] ? <TouchableOpacity onPress={()=>displayAllImages(item.id) } >
            { item.imageUrl.map((image, index) => (
              <View>

                        <Image
                          key={index}
                          source={{ uri: image }}
                          style={{ height: 400, borderRadius: 10 }}
                          onError={(e) => console.log("Image error", e.nativeEvent.error)}
                        /> 
                        </View>
                      ))}
         
            </TouchableOpacity>
            :  <TouchableOpacity onPress={()=>displayAllImages(item.id) } >

                {ImageDsp}
                
              </TouchableOpacity>

            }
        
             <View>
                <Text> {item.companyName}</Text>
                <Text> {item.teamNames}</Text>
                <Text> {item.location}</Text>
                <Text style={{fontSize:12 , fontStyle:'italic' , color:'green'}} >Date {item.currentDateTime} @ {item.currentTime}  </Text>
            </View>
        </View>
)
})

    return(
      <View style={{paddingTop:10}} > 
            

           <ScrollView style={{padding : 10 }}>
         {updates.length > 0 ? rendereIterms   : <Text>BlackList Loading.........</Text>}
         <View style={{height : 550}} >
           </View>
        </ScrollView>
         </View>
    )

}
export default React.memo(Blacklist)