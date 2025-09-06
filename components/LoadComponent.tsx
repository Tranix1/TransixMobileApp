import { StyleSheet, TouchableOpacity, View, TouchableHighlight , Linking  } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Load } from '@/types/types'
import { wp } from '@/constants/common'
import { useThemeColor } from '@/hooks/useThemeColor'
import { ThemedText } from './ThemedText'
import { Image } from 'expo-image'
import { EvilIcons, FontAwesome,  Ionicons,  Octicons } from '@expo/vector-icons'
import { formatCurrency } from '@/services/services'
import Divider from './Divider'
import FormatedText from './FormatedText'
import ImageViewing from 'react-native-image-viewing';
import { AntDesign } from '@expo/vector-icons'; // or any close icon
import { WebView } from 'react-native-webview';

const DspAllLoads = ({ item = {} as Load, expandID = '', expandId = (id: string) => { }, ondetailsPress = () => { } }) => {
  const backgroundLight = useThemeColor('backgroundLight')
  const background = useThemeColor('background')
  const coolGray = useThemeColor('coolGray')
  const icon = useThemeColor('icon')
  const textColor = useThemeColor('text')
  const accent = useThemeColor('accent')

  const [expand, setExpand] = useState(false)

  

  const [dspProofImage, setDspProofImage] = useState(false);
    function dspProofOfOrder(proofOfOrderType : string){
      console.log(proofOfOrderType)
      if(proofOfOrderType ==="pdf"){
        Linking.openURL(item.proofOfOrder)

      }else if (proofOfOrderType==="image" ){
        setDspProofImage(true)
      }else{

      }
    }  


  function replaceSpacesWithPercent(url: string): string {
    return url.replace(/ /g, '%20');
  }
  function toggleItemById(
    id: string,
  ): void {
    setExpand(!expand)
    if (!expand)
      expandId(id)
    else
      expandId('')
  }


 
  const url = `https://transix.net/selectedUserLoads/${item.userId}/${item.companyName}/${item.deletionTime}`;
  const updatedUrl = replaceSpacesWithPercent(url);
  const message = `${item.companyName}
        Is this Load still available
        ${item.typeofLoad} from ${item.origin} to ${item.destination}
        ${item.rate}

        From: ${updatedUrl}`;




  useEffect(() => {
    if (expandID === item.id) {
      setExpand(true)
    } else {
      setExpand(false)
    }
  }, [expandID])


  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: background, borderColor: accent }]}
      activeOpacity={0.8}
    >


      <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(2), justifyContent: 'space-between', marginBottom: wp(1) }}>

           <View style={{ flexDirection: 'row' }}>

                                {!item?.logo && <FontAwesome name='user-circle' color={coolGray} size={wp(9)} />}
                                {item?.logo && <Image
                                    style={{ width: 35, height: 35, borderRadius: 17.5, backgroundColor: '#ddd', }}
                                    source={{ uri: item?.logo || 'https://via.placeholder.com/100' }}
                                />}

                                {item &&
                                    <ThemedText type="subtitle" style={{marginLeft:20}}>{item.companyName}</ThemedText>
                                }
                            </View>


  <View style={{ alignItems: 'flex-end', gap: wp(0.5) }}>
          {item.distance && (
            <ThemedText type="tiny" style={styles.distanceInfo}>
              Distance: {item.distance}
            </ThemedText>
          )}
          {item.duration && (
            <ThemedText type="tiny" style={styles.distanceInfo}>
              Duration: {item.duration}
            </ThemedText>
          )}
          {item.durationInTraffic && (
            <ThemedText type="tiny" style={styles.distanceInfo}>
              In Traffic: {item.durationInTraffic}
            </ThemedText>
          )}
        </View>
        
        <TouchableHighlight underlayColor={backgroundLight} onPress={ondetailsPress} style={{ backgroundColor: background, padding: wp(1), borderRadius: wp(90) }}>
          <Ionicons name='ellipsis-vertical' size={wp(4)} color={icon} />
        </TouchableHighlight>

      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          {/* <Feather name="package" size={wp(4)} style={styles.icon} color={icon} /> */}
          <View style={{ marginBottom: wp(1) }}>
            <ThemedText type='tiny' style={{ fontSize:13,fontStyle:'italic' }}>
              Load
            </ThemedText>
            <ThemedText type='subtitle'>
              {item.typeofLoad}
            </ThemedText>
          </View>
        </View>
        <View style={styles.tagsContainer}>
          {item.returnLoad && (
            <View style={[styles.tag, { backgroundColor: backgroundLight }]}>
              <ThemedText type='tiny' style={{}}>Return Load</ThemedText>
            </View>
          )}
            
                {item.proofOfOrderType && (
            <View style={[styles.tag, { backgroundColor: backgroundLight }]}>
              <ThemedText type='tiny' style={{}}>Proof Attached</ThemedText>
            </View>
          )}

          {item.roundTrip && (
            <View style={[styles.tag, { backgroundColor: backgroundLight }]}>
              <ThemedText type='tiny' style={{}}>Round Trip</ThemedText>
            </View>
          )}
         
          {item.isVerified && (
            <View style={[{ flexDirection: 'row', alignItems: 'center', gap: wp(1) }]}>
              <Octicons name='verified' size={wp(4)} color={'#4eb3de'} />
            </View>
          )}


        </View>


      </View>
      <View style={[styles.detailRow, { backgroundColor: backgroundLight, padding: wp(2), borderRadius: wp(2) }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, }}>

          <View style={{ gap: wp(1), flex: 2, }}>
            <ThemedText type='default' style={{ fontSize:13,fontStyle:'italic' }}>
              From
            </ThemedText>
            <ThemedText type='defaultSemiBold' style={{ fontSize: wp(4) }}>
              {item.origin}
            </ThemedText>
          </View>
          <View style={{ gap: wp(1), flex: 2, }}>
            <ThemedText type='default' style={{  fontSize:13,fontStyle:'italic'  }}>
              To
            </ThemedText>
            <ThemedText type='defaultSemiBold' style={{ fontSize: wp(4) }}>
              {item.destination}
            </ThemedText>
          </View>
        </View>
      </View>

            <View style={{backgroundColor: backgroundLight,  padding: wp(2), borderRadius: wp(2) }}>

    
        <View style={styles.detailRow}>
          <ThemedText type='default' style={{ flex: 2 }}>
            Rate {item.model}
          </ThemedText>
          <ThemedText type='subtitle' style={[{ color: textColor, fontSize: wp(4.5), lineHeight: wp(5), flex: 2 }]}>
           {item.currency} {formatCurrency(item.rate)}
          </ThemedText>
          
        </View>
           {item.rateexplantion && <View style={styles.detailRow }>
          <ThemedText type='default' style={{ flex: 2 }}>
            Rate Exlantion
          </ThemedText>
          <ThemedText type='subtitle' style={[{ color: textColor, fontSize: wp(4.5), lineHeight: wp(5), flex: 2 }]}>
           {item.rateexplantion}
          </ThemedText>
          
        </View>}

            </View>
            

      <View style={[{ marginTop: wp(1), backgroundColor: backgroundLight, padding: wp(2), borderRadius: wp(2), flex: 1, gap: wp(2) }]}>

        {item.requirements &&
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, }}>
            <ThemedText type='default' style={{ flex: 2 }}>
              Payment Terms
            </ThemedText>
            <ThemedText type='defaultSemiBold' style={{ flex: 2 }}>
              {item.paymentTerms}
            </ThemedText>
          </View>
        }
             {item.loadingDate &&
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, }}>
            <ThemedText type='default' style={{ flex: 2 }}>
              Laoding
            </ThemedText>
            <ThemedText type='defaultSemiBold' style={{ flex: 2 }}>
              {item.loadingDate }
            </ThemedText>
          </View>
        }

         {item.alertMsg && (
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, }}>
            <ThemedText type='default' style={{ flex: 2 }}>
              Alert 
            </ThemedText>
            <ThemedText type='defaultSemiBold' style={{ flex: 2 }}>
              {item.alertMsg}
            </ThemedText>
          </View>
        )}
        
        {item.fuelAvai && (
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, }}>
            <ThemedText type='default' style={{ flex: 2 }}>
              Fuel & Tolls
            </ThemedText>
            <ThemedText type='defaultSemiBold' style={{ flex: 2 }}>
              {item.fuelAvai}
            </ThemedText>
          </View>
        )}
        {item.requirements &&
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, }}>
            <ThemedText type='default' style={{ flex: 2 }}>
              Requirements
            </ThemedText>
            <ThemedText type='defaultSemiBold' style={{ flex: 2 }}>
              {item.requirements}
            </ThemedText>
          </View>
        }



       

        {expand && (
          <View>

            {item.additionalInfo && (
              <>
                <Divider />

                <View style={{ flex: 1, gap: wp(2), marginTop: wp(2) }}>
                  <ThemedText type='tiny' style={{ flex: 2 }}>
                    Additional Info
                  </ThemedText>
                  <FormatedText numberOfLines={8} style={{ flex: 1 }}>
                    {item.additionalInfo}
                  </FormatedText>
                </View>
              </>
            )}
          

            <Divider style={{ marginTop: wp(2) }} />
            {item.returnLoad && (
              <View style={{ marginTop: wp(2), gap: wp(2) }}>
                <ThemedText type='tiny' style={{ marginBottom: wp(1) }}>
                  Return Load
                </ThemedText>

                {item.returnLoad && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, }}>
                    <ThemedText type='default' style={{ flex: 2 }}>
                      Load Details
                    </ThemedText>
                    <ThemedText type='defaultSemiBold' style={{ flex: 2 }}>
                      {item.returnLoad}
                    </ThemedText>
                  </View>
                )}
                {item.returnRate && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, }}>
                    <ThemedText type='default' style={{ flex: 2 }}>
                      Return Rate
                    </ThemedText>
                    <ThemedText type='defaultSemiBold' style={{ flex: 2 }}>
                      {item.returnRate}
                    </ThemedText>
                  </View>
                )}
                {item.returnTerms && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, }}>
                    <ThemedText type='default' style={{ flex: 2 }}>
                      Return Terms
                    </ThemedText>
                    <ThemedText type='defaultSemiBold' style={{ flex: 2 }}>
                      {item.returnTerms}
                    </ThemedText>
                  </View>
                )}


              </View>
            )}


            <View style={{ marginTop: wp(2), gap: wp(2) }}>
                  <ThemedText type='tiny' style={{ marginBottom: wp(1) }}>Trucks Required</ThemedText>
                  
                  {item.trucksRequired.map((neededTruck , index)=>(
                    <View style={{flexDirection:"row",justifyContent:'space-evenly'}} key={index} > 
                      <ThemedText>{neededTruck.truckType?.name} </ThemedText>
                      <ThemedText>{neededTruck.capacity?.name} </ThemedText>
                      <ThemedText>{neededTruck.cargoArea?.name} </ThemedText>
                    </View>
                  ) )  }
            </View>

<Divider style={{ marginTop: wp(2) }} />

<TouchableOpacity style={{
    backgroundColor: '#2563eb', // simple professional blue
    paddingVertical: wp(2),
    paddingHorizontal: wp(4),
    borderRadius: wp(4),
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: wp(2),
    elevation: 4,
  }} >
<ThemedText>View On Map</ThemedText>
</TouchableOpacity>

                 {item.proofOfOrder && <TouchableOpacity style={styles.proofButton} onPress={()=>dspProofOfOrder(item.proofOfOrderType) }>
  <ThemedText type="defaultSemiBold" style={styles.proofButtonText}>
    Proof of order
  </ThemedText>
</TouchableOpacity>}




<ImageViewing
  images={[{ uri: item.proofOfOrder}]} 
  imageIndex={0} 
  visible={dspProofImage}
  onRequestClose={() => setDspProofImage(false)}
  presentationStyle="fullScreen"
  HeaderComponent={() => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 8,
        paddingHorizontal: 15,
        position: 'absolute',
        top: 10,
        zIndex: 999,
        backgroundColor: backgroundLight,
        borderRadius: 5,
      }}
    >
      <TouchableOpacity onPress={() => setDspProofImage(false)} style={{ marginRight: 8, marginLeft: 4 }}>
        <AntDesign name="close" size={15} color="#fff" />
      </TouchableOpacity>
      <ThemedText style={{ fontWeight: 'bold', fontSize: 14 }}>
        Proof of Order
      </ThemedText>
    </View>
  )}
/>


          </View>
        )}

      </View>
      <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: wp(1), marginTop: wp(2) }} onPress={() => toggleItemById(item.id)}>
        <EvilIcons color={icon} size={wp(6)} name={expand ? 'chevron-up' : 'chevron-down'} />
             </TouchableOpacity>

   
      
    </TouchableOpacity>
  );
};

export default DspAllLoads;

const styles = StyleSheet.create({
  container: {
    margin: wp(2),
    borderWidth: 0.5,
    borderRadius: wp(6),
    paddingHorizontal: wp(4),
    paddingBottom: wp(4),
    paddingVertical: wp(2),
    shadowColor: '#3535353b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 13
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1),
    padding: wp(1),
    backgroundColor: 'white',
    position: 'absolute',
    right: wp(4),
    top: wp(4),
    borderRadius: wp(4),
  },
  title: {
    marginBottom: wp(2),
    fontSize: wp(5)
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: wp(2),
    marginBottom: wp(2)
  },
  tag: {
    paddingHorizontal: wp(2),
    paddingVertical: wp(1),
    borderRadius: wp(4),
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: wp(1),
  },
  icon: {
    width: wp(6),
  },
  contactButton: {
    height: wp(8),
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    justifyContent: 'center',
    marginBottom: wp(2),
    borderRadius: wp(2),
    paddingHorizontal: wp(2)
  },
  bidContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: wp(3),
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0'
  },
  bidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: wp(2)
  },
  bidInput: {
    height: wp(8),
    borderBottomWidth: 1,
    borderBottomColor: '#6a0c0c',
    padding: 0,
    paddingLeft: wp(4),
    width: wp(45),
    marginHorizontal: wp(2)
  },
  buttonTrue: {
    backgroundColor: '#6a0c0c',
    paddingHorizontal: wp(2),
    paddingVertical: wp(1),
    color: 'white',
    borderRadius: wp(1)
  },
  buttonFalse: {
    borderWidth: 1,
    borderColor: '#6a0c0c',
    paddingHorizontal: wp(2),
    paddingVertical: wp(1),
    color: 'black',
    borderRadius: wp(1)
  },
  bidActions: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: wp(2)
  },
  bidActionButton: {
    paddingHorizontal: wp(4),
    paddingVertical: wp(1),
    borderRadius: wp(1)
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: wp(2),
    gap: wp(2)
  },
  actionButton: {
    alignItems: "center",
    justifyContent: 'center',
    borderRadius: wp(2),
    padding: wp(1),
    paddingHorizontal: wp(2),
    flexDirection: 'row',
    gap: wp(1),
  },
  bookingButtons: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: wp(3)
  },
  bookingButton: {
    width: wp(25),
    height: wp(10),
    alignItems: "center",
    justifyContent: 'center',
    borderRadius: wp(2),
  },proofButton: {
  backgroundColor: "#4eb37a", // matches theme
  paddingVertical: wp(2),
  paddingHorizontal: wp(4),
  borderRadius: wp(4),
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'row',
  gap: wp(1),
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 4
},
proofButtonText: {
  color: '#fff',
  fontSize: wp(4),
  textTransform: 'uppercase',
  letterSpacing: 0.5
},distanceInfo: {
  fontSize: wp(2.8),
  color: '#6b7280', // professional gray, visible on light/dark
  textAlign: 'right',
},

});

