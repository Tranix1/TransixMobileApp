// import React, { useEffect, useState } from 'react';
// import { db, auth } from '../config/fireBase';
// import { View , Text  , ScrollView ,TouchableOpacity ,  StyleSheet , ActivityIndicator} from 'react-native';
// import {onSnapshot ,  query ,collection,where ,deleteDoc, doc} from "firebase/firestore"

// import { useNavigate} from 'react-router-dom';
// import VerifiedIcon from '@mui/icons-material/Verified';
// // import MaterialIcons from '@expo/vector-icons/MaterialIcons';
// import ArrowBackIcon from '@mui/icons-material/ArrowBack';
// import DeleteIcon from '@mui/icons-material/Delete';
// import { getStorage, ref, deleteObject } from 'firebase/storage';

// function ManageStock(){ 

//       const [spinnerItem, setSpinnerItem] = React.useState(false);
 


//     const deleteLoad = async (id , imageUrls) => {

//     setSpinnerItem(true);

//         imageUrls.forEach(async (imageUrl) => {
           
//           fetch(imageUrl, {
//             method: 'DELETE',
//           }).then(response => {
//               if (response.ok) {
//                 const loadsDocRef = doc(db, 'Shop', id);
//                 deleteDoc(loadsDocRef);
//                 console.log('Document deleted successfully');
//               } else {
//                 console.log('Error deleting image:', response.status);
//     setSpinnerItem(false);
//               }
//             })
//             .catch(error => {
//               alert('Error deleting image:', error);
//     setSpinnerItem(false);
//             });
//         });

//     setSpinnerItem(false);
//     } 







//     const navigate = useNavigate()
//   const [allTrucks, setAllTrucks] = useState([]);

//       let [buyRent , setBuyRent] = React.useState(null)
//   useEffect(() => {
//     try {
//         const userId = auth.currentUser.uid;
//         // const dataQuery = query(collection(db, "Shop"), where("userId" ,"==", userId) );
//       let dataQuery
//         if(buyRent=== true || buyRent === false ) {
//           dataQuery = query(collection(db, "Shop"), where("userId" ,"==", userId), where("sellRent" ,"==", buyRent) );
//         }else{
//           setBuyRent(null)
//           dataQuery = query(collection(db, "Shop"), where("userId" ,"==", userId));
//         }

//         const unsubscribe = onSnapshot(dataQuery, (snapshot) => {
//           const loadedData = [];
//           snapshot.docChanges().forEach((change) => {
//             if (change.type === 'added' || change.type === 'modified') {
//               const dataWithId = { id: change.doc.id, ...change.doc.data() };
//               loadedData.push(dataWithId);
//             }
//           });

//         setAllTrucks(loadedData);
//         });
        
//         // Clean up function to unsubscribe from the listener when the component unmounts
//         return () => unsubscribe();
//     } catch (err) {
//       console.error(err);
//     }
//   }, [allTrucks]); 

   

//   const rendereIterms = allTrucks.map((item)=>{

   
//     return(
//       <View key={item.id} style={{padding :7}}>
//       { item.trailerType && ( <Text> trailer type {item.trailerType}  </Text> ) }

//       { item.isVerified&& <View style={{position : 'absolute' , top : 0 , right : 0 , backgroundColor : 'white' , zIndex : 66}} >
//             <VerifiedIcon style={{color : 'green'}} />
//       </View>}
//         <View>
//           {item.sellOBuy ==="forSell"  &&<ScrollView  horizontal  showsHorizontalScrollIndicator={false} style={{  height : 200 ,}} >
//         {item.imageUrl.map((image, index) => (
//           <View>
//             {
//               image ?
//             <img key={index} src={image} alt={`Image ${index}`} style={{ margin: 7, maxWidth: '100%', height: 200, }} loading='lazy'/>
//             : <Text style={{alignSelf:'center'}} >quality images loading </Text>
//             }
//           </View>
//         ))}

//           </ScrollView>} 
          

//       {<View style={{ position : 'absolute' , bottom :0 , left :0 ,flexDirection:'row'}} >

//          {item.brandNew &&  <View style={{backgroundColor :'#40E0D0',paddingLeft :4 , paddingRight:4 , marginLeft :7}} >
//           <Text style={{color :'white'}} > brand New</Text>
//           </View>}

//          {item.swapA &&  <View style={{backgroundColor :'#008080',paddingLeft :4 , paddingRight:4 , marginLeft :7}} >
//           <Text style={{color :'white'}} >Swap</Text>
//           </View>}

//          {item.negetiatable &&  <View style={{backgroundColor :'#25D366',paddingLeft :4 , paddingRight:4 , marginLeft :7}} >
//           <Text style={{color :'white'}} >Negotiable</Text>
//           </View>}

//       </View>}

//           </View>
      
//       <Text style={{marginLeft : 60 , fontWeight : 'bold', fontSize : 20 , color:"#6a0c0c" , textAlign:'center'}} >{item.CompanyName} </Text>
//         {item.productName &&<Text>Product {item.productName} </Text> }
//         {item.price &&<Text>Price :  {item.currency?"USD" : "Rand" }  {item.price} </Text> }
//         {item.shopLocation &&<Text>Country {item.location}  in {item.shopLocation} </Text> }



//        {<View>
//       { item.contact && ( <Text>contact {item.contact}</Text> )}
//       {item.additionalInfo && (<Text> additional Info {item.additionalInfo} </Text>)}
//         </View>}


//       { spinnerItem &&<ActivityIndicator size={36} />}
//        <TouchableOpacity onPress={()=>del{eteLoad(item.id , item.imageUrl)} >
//               <DeleteIcon style={{color : 'red'} }/>
//         </TouchableOpacity> 

//     </View>
//         )
//       })

// return(
//   <View style={{paddingTop:76}} >
//     <View style={{position:'absolute' , top : 0 , left: 0 , right : 0 , flexDirection : 'row' , height : 74  ,  paddingLeft : 6 , paddingRight: 15 , paddingTop:10 ,backgroundColor : '#6a0c0c' ,paddingTop : 15 , alignItems : 'center' , }} >
//          <TouchableOpacity style={{marginRight: 10}} onPress={() => navigate(-1)}>
//            <ArrowBackIcon style={{color : 'white'}} />
//         </TouchableOpacity> 
//         <Text style={{fontSize: 20 , color : 'white'}} > Manage Stock </Text>
//        </View>
//         <ScrollView>

//      { <ScrollView  horizontal  showsHorizontalScrollIndicator={false}  >


//           <TouchableOpacity onPress={()=> setBuyRent(null)} style={buyRent === null ? styles.btnIsActive : styles.bynIsUnActive } >
//             <Text style={ buyRent=== null ? {color : 'white'}: {color : 'black'} } >All </Text>
//           </TouchableOpacity>
//           <TouchableOpacity onPress={()=> setBuyRent(true)} style={buyRent === true ? styles.btnIsActive : styles.bynIsUnActive } >
//             <Text style={ buyRent=== true ? {color : 'white'}: {color : 'black'} } >Buy </Text>
//           </TouchableOpacity>

//           <TouchableOpacity onPress={()=> setBuyRent(false)} style={buyRent === false ? styles.btnIsActive : styles.bynIsUnActive }>
//             <Text style={ buyRent=== false ? {color : 'white'}: {color : 'black'} } >Rent</Text>
//           </TouchableOpacity>

//         </ScrollView>}

//       <div className="Main-grid">
//          {allTrucks.length > 0 ? rendereIterms   : <Text>Loading...</Text>}
//          <View style={{height : 550}} >
//            </View>
//            </div>
//         </ScrollView> 
//         </View>
// )
// }


// export default React.memo(ManageStock)

// const styles = StyleSheet.create({
//   bynIsUnActive : {
//     width : 50 ,
//     color :'white'  , 
//     borderWidth:1, 
//     alignItems :'center' ,
//      justifyContent :'center' ,
//       marginRight : 7 ,
//        borderRadius : 15
//   },
//   btnIsActive : {
//     width : 50 ,
//     color :'white'  , 
//     alignItems :'center' ,
//      justifyContent :'center' ,
//       marginRight : 7 ,
//        borderRadius : 15 ,
//        backgroundColor : 'rgb(129,201,149)'
//   }

// });

