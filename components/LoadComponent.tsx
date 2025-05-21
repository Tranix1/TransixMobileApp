import { StyleSheet, TouchableOpacity, View, ActivityIndicator, Linking, TouchableHighlight } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Load } from '@/types/types'
import { wp } from '@/constants/common'
import { useThemeColor } from '@/hooks/useThemeColor'
import { ThemedText } from './ThemedText'
import { Image } from 'expo-image'
import { AntDesign, EvilIcons, Feather, FontAwesome5, FontAwesome6, Fontisto, Ionicons, MaterialIcons, Octicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { auth, db } from '../app/components/config/fireBase'
import { serverTimestamp, where, doc, deleteDoc } from 'firebase/firestore'
import { addDocument, checkDocumentExists, runFirestoreTransaction, setDocuments } from '@/db/operations'
import Input from './Input'
import { formatCurrency } from '@/services/services'
import Divider from './Divider'
import FormatedText from './FormatedText'

const DspAllLoads = ({ item = {} as Load, expandID = '', expandId = (id: string) => { }, ondetailsPress = () => { } }) => {
  const backgroundLight = useThemeColor('backgroundLight')
  const background = useThemeColor('background')
  const coolGray = useThemeColor('coolGray')
  const icon = useThemeColor('icon')
  const textColor = useThemeColor('text')
  const accent = useThemeColor('accent')

  const [loadsList, setLoadsList] = useState<Load[]>([]);
  const [contactDisplay, setContactDisplay] = React.useState<{ [key: string]: boolean }>({ ['']: false });
  const [bidDisplay, setBidDisplay] = React.useState<{ [key: string]: boolean }>({ ['']: false });
  const [dspMoreInfo, setDspMoreInfo] = React.useState<{ [key: string]: boolean }>({ ['']: false });
  const [spinnerItem, setSpinnerItem] = React.useState<Load | null>(null);
  const [currencyBid, setCurrencyBid] = React.useState(true);
  const [perTonneBid, setPerTonneBid] = React.useState(false);
  const [bidRate, setBidRate] = React.useState('');
  const [bidLinks, setBidLinks] = React.useState('');
  const [bidTriaxle, setBdTriaxle] = React.useState('');
  const [addingUpdate, setAddingUpdate] = React.useState("")
  const [expand, setExpand] = useState(false)

  const deleteLoad = async (id: string) => {
    try {
      const loadsDocRef = doc(db, 'Loads', id);
      await deleteDoc(loadsDocRef);
      setLoadsList((prevLoadsList) => prevLoadsList.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const checkAndDeleteExpiredItems = () => {
    const deletionTime = item.deletionTime;
    const timeRemaining = deletionTime - Date.now();
    if (timeRemaining <= 0) {
      // deleteLoad(item.id);
    } else {
      setTimeout(() => {
        // deleteLoad(item.id);
      }, timeRemaining);
    }
  };

  setTimeout(() => {
    checkAndDeleteExpiredItems();
  }, 1000);

  const checkExistiDoc = async (docId: string): Promise<boolean> => {
    return await checkDocumentExists('bookings', [where('docId', '==', docId)])
  };

  const checkExistixtBBDoc = async (receriverId: string): Promise<boolean> => {
    return await checkDocumentExists('bidBookingStats', [where('receriverId', '==', receriverId)])
  };

  function toggleCurrencyBid() {
    setCurrencyBid((prev) => !prev);
  }

  function togglePerTonneBid() {
    setPerTonneBid((prev) => !prev);
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

  const handleSubmit = async (clickedItem: Load, dbName: 'bookings' | 'biddings') => {
    setSpinnerItem(clickedItem);
    const userId = auth.currentUser?.uid;
    if (!userId) {
      alert('User not authenticated');
      setSpinnerItem(null);
      return;
    }

    try {
      let theRate = bidRate && bidDisplay[item.id] ? bidRate : item.ratePerTonne;
      let thelinksRate = bidLinks && bidDisplay[item.id] ? bidLinks : item.links
      let thetriaxleRate = bidTriaxle && bidDisplay[item.id] ? bidTriaxle : item.triaxle
      let currencyB = currencyBid && bidDisplay[item.id] ? currencyBid : item.currency;
      let perTonneB = perTonneBid && bidDisplay[item.id] ? perTonneBid : item.ratePerTonne

      let docId = `${userId}${item.typeofLoad}${theRate}${item.userId}`;
      let existingChat;
      if (dbName === 'bookings') {
        existingChat = await checkExistiDoc(docId);
      }

      if (!existingChat) {
        if (item.isVerified) {
          setBidDisplay({ ['']: false });
          setBidRate('');
          setBidLinks('');
          setBdTriaxle('');
          setSpinnerItem(null);
          router.push({
            pathname: '/Logistics/Contracts/ViewContractDetails',
            params: {
              data: JSON.stringify({
                itemName: item.typeofLoad,
                location: item.location,
                destination: item.destination,
                bookerId: userId,
                ownerName: item.companyName,
                ownerId: item.userId,
                Accept: null,
                isVerified: item.isVerified,
                msgReceiverId: userId,
                docId: docId,
                rate: theRate,
                linksRate: thelinksRate,
                triaxleRate: thetriaxleRate,
                currencyB: currencyB,
                perTonneB: perTonneB,
                loadId: item.id,
                deletionTime: Date.now() + 4 * 24 * 60 * 60 * 1000,
                dbName: dbName,
              }),
            },
          });
          return;
        } else {
          let theRateD: string | undefined;
          if (theRate) {
            theRateD = `Rate ${theRate} ${perTonneB ? 'per tonne' : ''} `;
          } else if (thelinksRate && thetriaxleRate) {
            theRateD = `Links ${thelinksRate} Triaxle ${thetriaxleRate} ${perTonneB ? 'per tonne' : ''} `;
          } else if (thetriaxleRate) {
            theRateD = `Triaxle ${thetriaxleRate} ${perTonneB ? 'per tonne' : ''} `;
          } else if (thelinksRate) {
            theRateD = `Links ${thelinksRate} ${perTonneB ? 'per tonne' : ''} `;
          }

          let message = `${item.typeofLoad} ${dbName === 'bookings' ? 'Booked' : 'Bidded'} Rate ${theRateD} `;
          let tittle = `From ${item.location} to ${item.destination} `;

          addDocument(dbName, {
            itemName: item.typeofLoad,
            location: item.location,
            destination: item.destination,
            bookerId: userId,
            ownerName: item.companyName,
            ownerId: item.userId,
            Accept: null,
            isVerified: item.isVerified,
            msgReceiverId: userId,
            rate: theRate,
            linksRate: thelinksRate,
            triaxleRate: thetriaxleRate,
            currencyB: currencyB,
            perTonneB: perTonneB,
            loadId: item.id,
            deletionTime: Date.now() + 5 * 24 * 60 * 60 * 1000,
            timestamp: serverTimestamp(),
          })
        }

        setBidRate('');
        setBidLinks('');
        setBdTriaxle('');
        setBidDisplay({ ['']: false });
        alert(`${!bidDisplay[item.id] ? 'booking' : 'bidding'} was successfull`);
      } else {
        alert(`Already ${!bidDisplay[item.id] ? 'booked' : 'bidded'} this Item!`);
      }

      const existingBBDoc = await checkExistixtBBDoc(item.userId);
      let newBiddedDoc = 0;
      let newBOOKEDDoc = 0;

      dbName === 'bookings' ? (newBOOKEDDoc = 1) : (newBiddedDoc = 1);
      if (!existingBBDoc) {
        await setDocuments('bidBookingStats', {
          bookingdocs: newBOOKEDDoc,
          biddingdocs: newBiddedDoc,
          timestamp: serverTimestamp(),
          receriverId: item.userId
        })
      } else {
        await runFirestoreTransaction(`bidBookingStats/${item.userId}`, (data) => {
          const currentBiddingDocs = data.biddingdocs || 0;
          const currentBookingsDocs = data.bookingdocs || 0;

          return dbName !== "bookings"
            ? { biddingdocs: currentBiddingDocs + 1 }
            : { bookingdocs: currentBookingsDocs + 1 };
        });
      }

      setSpinnerItem(null);
    } catch (err: any) {
      alert(err.toString());
      setSpinnerItem(null);
    }
  };

  let theRateM: string | undefined;
  if (item.ratePerTonne) {
    theRateM = `Rate ${item.ratePerTonne} ${item.ratePerTonne ? 'per tonne' : ''} `;
  } else if (item.links && item.triaxle) {
    theRateM = `Links ${item.links} Triaxle ${item.triaxle} ${item.ratePerTonne ? 'per tonne' : ''} `;
  } else if (item.triaxle) {
    theRateM = `Triaxle ${item.triaxle} ${item.ratePerTonne ? 'per tonne' : ''} `;
  } else if (item.links) {
    theRateM = `Links ${item.links} ${item.ratePerTonne ? 'per tonne' : ''} `;
  }

  const url = `https://transix.net/selectedUserLoads/${item.userId}/${item.companyName}/${item.deletionTime}`;
  const updatedUrl = replaceSpacesWithPercent(url);
  const message = `${item.companyName}
        Is this Load still available
        ${item.typeofLoad} from ${item.location} to ${item.destination}
        ${theRateM}

        From: ${updatedUrl}`;

  const contactMe = (
    <View style={{ paddingLeft: wp(4) }}>
      {auth.currentUser && <TouchableOpacity style={[styles.contactButton, { borderColor: accent }]}>
        <ThemedText style={{ color: accent }}>Message now</ThemedText>
        <MaterialIcons name="chat" size={wp(6)} color={accent} />
      </TouchableOpacity>}

      <TouchableOpacity
        onPress={() => Linking.openURL(`whatsapp://send?phone=${item.contact}&text=${encodeURIComponent(message)}`)}
        style={[styles.contactButton, { borderColor: '#25D366' }]}
      >
        <ThemedText style={{ color: "#25D366" }}>WhatsApp</ThemedText>
        <FontAwesome6 name="whatsapp" size={wp(6)} color="#25D366" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => Linking.openURL(`tel:${item.contact}`)}
        style={[styles.contactButton, { borderColor: '#0074D9' }]}
      >
        <ThemedText style={{ color: '#0074D9' }}>Phone call</ThemedText>
        <MaterialIcons name="call" size={wp(6)} color="#0074D9" />
      </TouchableOpacity>
    </View>
  );

  const bidNow = (
    <View style={[styles.bidContainer, { backgroundColor: background }]}>
      {spinnerItem === item ? (
        <ActivityIndicator size={wp(8)} />
      ) : (
        <View>
          {item.ratePerTonne && (
            <View style={styles.bidRow}>
              <TouchableOpacity onPress={toggleCurrencyBid}>
                <ThemedText style={currencyBid ? styles.buttonFalse : styles.buttonTrue}>
                  {currencyBid ? "USD" : "RAND"}
                </ThemedText>
              </TouchableOpacity>

              <Input
                onChangeText={(text) => setBidRate(text)}
                value={bidRate}
                keyboardType="numeric"
                placeholderTextColor={coolGray}
                style={styles.bidInput}
                placeholder="Bid rate here"
              />

              <TouchableOpacity onPress={togglePerTonneBid}>
                <ThemedText style={perTonneBid ? styles.buttonTrue : styles.buttonFalse}>
                  Per tonne
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}

          {(item.links || item.triaxle) && (
            <View>
              {item.links && (
                <View style={styles.bidRow}>
                  <TouchableOpacity onPress={toggleCurrencyBid}>
                    <ThemedText style={currencyBid ? styles.buttonFalse : styles.buttonTrue}>
                      {currencyBid ? "USD" : "RAND"}
                    </ThemedText>
                  </TouchableOpacity>

                  <Input
                    onChangeText={(text) => setBidLinks(text)}
                    value={bidLinks}
                    keyboardType="numeric"
                    placeholderTextColor={coolGray}
                    style={styles.bidInput}
                    placeholder="Bid Links rate"
                  />

                  <TouchableOpacity onPress={togglePerTonneBid}>
                    <ThemedText style={perTonneBid ? styles.buttonTrue : styles.buttonFalse}>
                      Per tonne
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              )}

              {item.triaxle && (
                <View style={styles.bidRow}>
                  <TouchableOpacity onPress={toggleCurrencyBid}>
                    <ThemedText style={currencyBid ? styles.buttonFalse : styles.buttonTrue}>
                      {currencyBid ? "USD" : "RAND"}
                    </ThemedText>
                  </TouchableOpacity>

                  <Input
                    onChangeText={(text) => setBdTriaxle(text)}
                    value={bidTriaxle}
                    keyboardType="numeric"
                    placeholderTextColor={coolGray}
                    style={styles.bidInput}
                    placeholder="Bid triaxle rate"
                  />

                  <TouchableOpacity onPress={togglePerTonneBid}>
                    <ThemedText style={perTonneBid ? styles.buttonTrue : styles.buttonFalse}>
                      Per tonne
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>
      )}

      <View style={styles.bidActions}>
        <TouchableOpacity
          onPress={() => toggleItemById(item.id)}
          style={[styles.bidActionButton, { backgroundColor: coolGray }]}
        >
          <ThemedText style={{ color: 'white' }}>Cancel</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleSubmit(item, "biddings" as 'biddings')}
          style={[styles.bidActionButton, { backgroundColor: accent }]}
        >
          <ThemedText style={{ color: 'white' }}>Send</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );

  const getFirstThreeLetters = (str: string | undefined): string => {
    return str ? str.slice(0, 3) : '';
  };
  const firstLetter = getFirstThreeLetters(item.companyName);


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

        <ThemedText type='subtitle' style={[styles.title, { color: textColor }]}>
          {item.companyName}
        </ThemedText>
        <TouchableHighlight underlayColor={backgroundLight} onPress={ondetailsPress} style={{ backgroundColor: background, padding: wp(1), borderRadius: wp(90) }}>
          <Ionicons name='ellipsis-vertical' size={wp(4)} color={icon} />
        </TouchableHighlight>

      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          {/* <Feather name="package" size={wp(4)} style={styles.icon} color={icon} /> */}
          <View style={{ marginBottom: wp(1) }}>
            <ThemedText type='tiny' color={coolGray}>
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
          {item.roundTrip && (
            <View style={[styles.tag, { backgroundColor: backgroundLight }]}>
              <ThemedText type='tiny' style={{}}>Round Trip</ThemedText>
            </View>
          )}
          {/* {item.fuelAvai && (
            <View style={[styles.tag, { backgroundColor: backgroundLight }]}>
              <ThemedText style={{ color: 'white' }}>Fuel</ThemedText>
            </View>
          )} */}
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
            <ThemedText type='default' style={{ color: coolGray }}>
              From
            </ThemedText>
            <ThemedText type='defaultSemiBold' style={{ fontSize: wp(4) }}>
              {item.location}
            </ThemedText>
          </View>
          <View style={{ gap: wp(1), flex: 2, }}>
            <ThemedText type='default' style={{ color: coolGray }}>
              To
            </ThemedText>
            <ThemedText type='defaultSemiBold' style={{ fontSize: wp(4) }}>
              {item.destination}
            </ThemedText>
          </View>
        </View>
      </View>

      {item.distance && (
        <View style={[styles.detailRow, { backgroundColor: backgroundLight, padding: wp(2), borderRadius: wp(2) }]}>
          <ThemedText type='default' style={{ flex: 2 }}>
            Estimated Distance
          </ThemedText>
          <ThemedText type='defaultSemiBold' style={{ flex: 2 }}>
            {item.distance} km
          </ThemedText>
        </View>
      )}
      {item.distance && (
        <View style={[styles.detailRow, { backgroundColor: backgroundLight, padding: wp(2), borderRadius: wp(2) }]}>
          <ThemedText type='default' style={{ flex: 2 }}>
            Rate Per Tonne
          </ThemedText>
          <ThemedText type='subtitle' style={[{ color: textColor, fontSize: wp(4.5), lineHeight: wp(5), flex: 2 }]}>
            {formatCurrency(item.ratePerTonne ? item.ratePerTonne : item.links ? item.links : item.triaxle)}
          </ThemedText>
        </View>
      )}

      {/* {!item.links && !item.triaxle && item.ratePerTonne && (
          <View style={styles.detailRow}>
            <FontAwesome5 name="money-bill-wave" size={wp(4)} style={styles.icon} color={icon} />
            <ThemedText type='default' style={{ color: accent, fontWeight: 'bold' }}>
              {item.currency ? "USD" : "RAND"} {item.ratePerTonne} {item.ratePerTonne ? "Per tonne" : null}
            </ThemedText>
          </View>
        )}

      {item.links && (
        <View style={styles.detailRow}>
          <FontAwesome5 name="link" size={wp(4)} style={styles.icon} color={icon} />
          <ThemedText type='default' style={{ color: accent, fontWeight: 'bold' }}>
            {item.currency ? "USD" : "RAND"} {item.links} {item.ratePerTonne ? "Per tonne" : null}
          </ThemedText>
        </View>
      )} */}

      {/* {item.triaxle && (
        <View style={styles.detailRow}>
          <FontAwesome5 name="truck" size={wp(4)} style={styles.icon} color={icon} />
          <ThemedText type='default' style={{ color: accent, fontWeight: 'bold' }}>
            {item.currency ? "USD" : "RAND"} {item.triaxle} {item.ratePerTonne ? "Per tonne" : null}
          </ThemedText>
        </View>
      )} */}

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
        {item.fuelAvai && (
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, }}>
            <ThemedText type='default' style={{ flex: 2 }}>
              Fuel Terms
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



        {/* {item.activeLoading && (
            <View style={styles.detailRow}>
              <FontAwesome5 name="clock" size={wp(4)} style={styles.icon} color="#FF8C00" />
              <ThemedText type='default' style={{ color: "#FF8C00" }}>
                Active Loading....
              </ThemedText>
            </View>
          )} */}

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
            {/* 
            {item.alertMsg && (
              <View style={[styles.detailRow, { borderColor: 'rgba(220, 20, 60, 0.8)', padding: wp(1), paddingHorizontal: wp(2), gap: wp(1), borderWidth: .5, borderRadius: wp(2) }]}>
                <FontAwesome5 name="exclamation-triangle" size={wp(3)} style={styles.icon} color="rgba(220, 20, 60, 0.8)" />
                <ThemedText type='default' style={{ color: 'rgba(220, 20, 60, 0.8)' }}>
                  {item.alertMsg}
                </ThemedText>
              </View>
            )} */}

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
          </View>
        )}

      </View>
      <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: wp(1), marginTop: wp(2) }} onPress={() => toggleItemById(item.id)}>
        <EvilIcons color={icon} size={wp(6)} name={expand ? 'chevron-up' : 'chevron-down'} />
        {/* <ThemedText type='default' style={{}}>
            {expand ? "less" : "more"}
          </ThemedText> */}
      </TouchableOpacity>

      {/* {contactDisplay[item.id] && contactMe}

      {bidDisplay[item.id] && bidNow} */}
      {/*
      {!bidDisplay[item.id] && (

        <View style={styles.actionButtons}>
          <TouchableOpacity
            onPress={() => toggleItemById(item.id, setContactDisplay)}
            style={[styles.actionButton, { backgroundColor: coolGray }]}
          >
            <ThemedText style={{ color: 'white' }}>Get In Touch Now</ThemedText>
            <Ionicons name="chevron-up" size={wp(3)} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: accent }]}
          >
            <ThemedText style={{ color: 'white' }}>All {item.companyName} Loads</ThemedText>
          </TouchableOpacity> 


          {auth.currentUser ? (
            !bidDisplay[item.id] && !contactDisplay[item.id] && (
              <View style={{ flexDirection: 'row', gap: wp(2) }}>
                {spinnerItem === item ? (
                  <ActivityIndicator size={wp(8)} color={accent} />
                ) : (
                  <>
                    <TouchableOpacity
                      onPress={() => handleSubmit(item, "bookings" as 'bookings')}
                      style={[styles.actionButton, { backgroundColor: coolGray }]}
                    >
                      <ThemedText style={{ color: 'white' }}>Book</ThemedText>
                      <Ionicons name="chevron-up" size={wp(3)} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => toggleItemById(item.id, setBidDisplay)}
                      style={[styles.actionButton, { backgroundColor: coolGray }]}
                    >
                      <ThemedText style={{ color: 'white' }}>Bid</ThemedText>
                      <Ionicons name="chevron-up" size={wp(3)} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: coolGray }]}
                    >
                      <ThemedText style={{ color: 'white' }}>Message</ThemedText>
                      <Ionicons name="chevron-up" size={wp(3)} color="white" />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )
          ) : (
            <ThemedText type='default' style={{ color: 'red', textAlign: 'center', marginTop: wp(2) }}>
              Sign In to Book Bid and Message
            </ThemedText>
          )}
        </View>
      )}
        */}
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
  }
});

function toggleItemById(id: string, setBidDisplay: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>): void {
  throw new Error('Function not implemented.')
}
