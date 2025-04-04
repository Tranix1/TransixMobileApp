import React from "react";
import { View ,StyleSheet,TouchableOpacity , Text,ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

function ViewContractMoreInfo({route,navigation}) {
const {item } = route.params

  const [contrMoreInfo, setContractMoreInfo] = React.useState(false)
  function toggleDspMoreInfo() {
    setContractMoreInfo(prev => !prev)
  }

  const [dspRturnnLoads, setDspReturnLoads] = React.useState(false);

  function toggleDspReturnLoads(params) {
    setDspReturnLoads(true);
    setDspContractD(false);
    setDspLoadDe(false)
  }

  const [dspContractD, setDspContractD] = React.useState(false);

  function toggleDspContractD(params) {
    setDspContractD(true);
    setDspReturnLoads(false);
    setDspLoadDe(false)
  }

  // const [dspCommodity, setDspCommodity] = React.useState(false);

  // function toggleDspCommodity(params) {
  //   setDspCommodity(prev=> !prev);
  // }

  const [dsoLoadDe, setDspLoadDe] = React.useState(true)
  function dspLoadDet() {
    setDspLoadDe(true)
    setDspContractD(false);
    setDspReturnLoads(false);

  }

  // commodity  , contract Id , Contract Duration , Contract Rate ,  contract Route r R  outes ,  , Reuirements , Due Date , owner number , owner Id

        return (
<View style={{ paddingTop: 89, padding: 10 }} >
 <View style={{ position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', height: 74, paddingLeft: 6, paddingRight: 15, paddingTop: 10, backgroundColor: '#6a0c0c', paddingTop: 15, alignItems: 'center', }} >
        <TouchableOpacity style={{ marginRight: 10 }} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="white" style={{ marginLeft: 10 }} />
        </TouchableOpacity>

        <Text style={{ fontSize: 20, color: 'white' }} > Contracts in ${item.contractLocation} </Text>
      </View>

      <View style={{
        marginBottom: 8, padding: 7, borderWidth: 2, borderColor: '#6a0c0c', borderRadius: 8, shadowColor: '#6a0c0c',
        shadowOffset: { width: 1, height: 2 },

        shadowOpacity: 0.7,
        shadowRadius: 5, overflow: 'hidden', paddingTop: 45
      }} key={item.id} >

        <View style={{ height: 40, position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: "#6a0c0c", paddingBottom: 7, justifyContent: 'space-evenly' }} >
          <TouchableOpacity style={dsoLoadDe ? styles.bttonIsTrue : styles.buttonIsFalse} onPress={dspLoadDet} >
            <Text style={dsoLoadDe ? { color: 'white' } : null} >Load Details</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleDspContractD} style={dspContractD ? styles.bttonIsTrue : styles.buttonIsFalse}>
            <Text style={dspContractD ? { color: 'white' } : null}>Contract Details</Text>
          </TouchableOpacity>

          <TouchableOpacity style={dspRturnnLoads ? styles.bttonIsTrue : styles.buttonIsFalse} onPress={toggleDspReturnLoads}>
            <Text style={dspRturnnLoads ? { color: 'white' } : null}>Return Load</Text>
          </TouchableOpacity>


        </View>

        <Text style={{ color: '#9c2828', fontWeight: 'bold', fontSize: 20, alignSelf: 'center' }} >{item.companyName} </Text>
        <Text style={{fontStyle:'italic',fontSize:14, alignSelf:'center' ,fontWeight:'bold'}} >Trucks Left 10 </Text>

        {dsoLoadDe && <ScrollView showsVerticalScrollIndicator={false}>

          <Text style={{ color: '#9c2828', fontWeight: 'bold', fontSize: 19, marginTop: 7 }}> Commodiy </Text>
          <View style={styles.textRow} >
            <Text>i) {item.formData.commodity.frst} </Text>
            <Text>ii) {item.formData.commodity.scnd} </Text>
            <Text>iii) {item.formData.commodity.third} </Text>
            <Text>iV) {item.formData.commodity.forth} </Text>
          </View>


          <Text style={{ color: '#9c2828', fontWeight: 'bold', fontSize: 19, marginTop: 8 }}>Rate</Text>
          <View >


            <Text style={{ color: '#9c2828', fontWeight: 'bold', marginTop: 8, alignSelf: 'center' }} >Solid Rate</Text>
            <View style={[styles.textRow, styles.smallCard]}>

              <Text>i)  {item.formData.rate.solidFrst} </Text>
              <Text>ii) {item.formData.rate.solidScnd} </Text>
            </View>


            <Text style={{ color: '#9c2828', fontWeight: 'bold', marginTop: 8, alignSelf: 'center' }} >Triaxle</Text>
            <View style={[styles.textRow, styles.smallCard]} >
              <Text>1)  {item.formData.rate.triaxleFrst} </Text>
              <Text>ii){item.formData.rate.triaxlesScnd} </Text>
            </View>


            <Text style={{ color: '#9c2828', fontWeight: 'bold', marginTop: 8, alignSelf: 'center' }}>Link Rate</Text>
            <View style={[styles.textRow, styles.smallCard]}>
              <Text>i)  {item.formData.rate.linksFrst} </Text>
              <Text>ii)  {item.formData.rate.linksScnd} </Text>
            </View>
          </View>



          <Text style={{ color: '#9c2828', fontWeight: 'bold', fontSize: 19, marginTop: 8 }}>Routes</Text>
          <View >

            <View style={styles.smallCard} >

              <Text style={{ color: '#9c2828', fontWeight: 'bold', marginTop: 8, alignSelf: 'center' }} >There are many Routes and how the operate</Text>
              <Text >{item.manyRoutesAssign} </Text>


              <Text style={{ margin: 6 }}>The destination for all Routes is <Text style={{ color: 'green' }} >{item.formData.location.seventh} </Text> </Text>

              <Text style={{ color: '#9c2828', fontWeight: 'bold', marginTop: 8, alignSelf: 'center' }} > How the Routes are alocated</Text>
              <Text>{item.manyRoutesAllocaton} </Text>

              <Text style={{ color: '#9c2828', fontWeight: 'bold', marginTop: 8, alignSelf: 'center' }} >Explanation of the Routes </Text>
              <Text>{item.formDataScnd.manyRoutesOperation}</Text>
            </View>


            <Text style={{ color: '#9c2828', fontWeight: 'bold', marginTop: 8, alignSelf: 'center' }}>Locations</Text>
            <View style={[styles.textRow, styles.smallCard]} >
              <Text> i) {item.formData.location.frst} </Text>
              <Text>ii) {item.formData.location.scnd} </Text>
              <Text>iii) {item.formData.location.thrd} </Text>
              <Text>iv) {item.formData.location.forth} </Text>
              <Text>v) {item.formData.location.fifth} </Text>
              <Text>vi) {item.formData.location.sixth} </Text>
            </View>

          </View>


          <Text style={{ color: '#9c2828', fontWeight: 'bold', fontSize: 19, marginTop: 8 }}> Trucks Required </Text>
          <View style={styles.textRow}>
            <Text>i) {item.formData.trckRequired.frst}</Text>
            <Text>ii) {item.formData.trckRequired.scnd}</Text>
            <Text>iii) {item.formData.trckRequired.third}</Text>
            <Text>iv) {item.formData.trckRequired.forth}</Text>
            <Text>v) {item.formData.trckRequired.fifth}</Text>
          </View>


          <Text style={{ color: '#9c2828', fontWeight: 'bold', fontSize: 19, marginTop: 8 }} >Other Requirements </Text>
          <View style={styles.textRow}>
            <Text>i) {item.formData.otherRequirements.frst} </Text>
            <Text>ii) {item.formData.otherRequirements.scnd} </Text>
            <Text>iii) {item.formData.otherRequirements.third} </Text>
            <Text>iv) {item.formData.otherRequirements.forth} </Text>
          </View>



          <TouchableOpacity style={{ width: 300, height: 30, alignItems: "center", justifyContent: 'center', backgroundColor: '#228B22', borderRadius: 8, alignSelf: 'center', margin: 5 , marginTop: 14 }} onPress={()=> navigation.navigate('BookLContract')} >

            <Text style={{ color: 'white' }}> Book now due {item.formDataScnd.bookingClosingD} </Text>
          </TouchableOpacity>



          <View style={{height:150}}>
            
          </View>
        </ScrollView>}

        {dspRturnnLoads && <View>

          <Text style={{ color: '#9c2828', fontWeight: 'bold', fontSize: 19, marginTop: 8 }}>Return Commodiy </Text>
          <View style={styles.textRow} >
            <Text>i) {item.formData.returnCommodity.frst} </Text>
            <Text>ii) {item.formData.returnCommodity.scnd} </Text>
            <Text>iii) {item.formData.returnCommodity.third} </Text>
            <Text>iV) {item.formData.returnCommodity.forth} </Text>
          </View>

          <Text style={{ color: '#9c2828', fontWeight: 'bold', fontSize: 19, marginTop: 8 }}>Rate</Text>
          <View >


            <Text style={{ color: '#9c2828', fontWeight: 'bold', marginTop: 8, alignSelf: 'center' }} >Return Solid Rate</Text>
            <View style={[styles.textRow, styles.smallCard]}>

              <Text>i)  {item.formData.returnRate.solidFrst} </Text>
              <Text>ii) {item.formData.returnRate.solidScnd} </Text>
            </View>


            <Text style={{ color: '#9c2828', fontWeight: 'bold', marginTop: 8, alignSelf: 'center' }} >Return Triaxle rate</Text>
            <View style={[styles.textRow, styles.smallCard]} >
              <Text>1)  {item.formData.returnRate.triaxleFrst} </Text>
              <Text>ii){item.formData.returnRate.triaxlesScnd} </Text>
            </View>


            <Text style={{ color: '#9c2828', fontWeight: 'bold', marginTop: 8, alignSelf: 'center' }}>Return Link Rate</Text>
            <View style={[styles.textRow, styles.smallCard]}>
              <Text>i)  {item.formData.returnRate.linksFrst} </Text>
              <Text>ii)  {item.formData.returnRate.linksScnd} </Text>
            </View>
          </View>

        </View>}

        {dspContractD && (
  <View style={styles.container}>
    <Text style={styles.contractHeader}>9 Months Contract Available</Text>
    
    <View style={styles.infoRow}>
      <Text style={styles.label}>Starting Date</Text>
      <Text style={styles.value}>: {item.formDataScnd.startingDate}</Text>
    </View>
    
    <View style={styles.infoRow}>
      <Text style={styles.label}>Renewal</Text>
      <Text style={styles.value}>: {item.formDataScnd.contractRenewal}</Text>
    </View>
    
    <View style={styles.infoRow}>
      <Text style={[styles.label, styles.greenText]}>Payment Terms</Text>
      <Text style={styles.value}>: {item.formDataScnd.paymentTerms}</Text>
    </View>
    
    <View style={styles.infoRow}>
      <Text style={[styles.label, styles.greenText]}>Loads/Week</Text>
      <Text style={styles.value}>: {item.formDataScnd.loadsPerWeek}</Text>
    </View>
    
    <View style={styles.infoRow}>
      <Text style={[styles.label, styles.greenText]}>Fuel</Text>
      <Text style={styles.value}>: {item.formDataScnd.fuelAvai}</Text>
    </View>
    
    <View style={styles.infoRow}>
      <Text style={[styles.label, styles.blueText]}>Alert Message</Text>
      <Text style={styles.value}>: {item.formDataScnd.alertMsg}</Text>
    </View>
    
    <View style={styles.infoRow}>
      <Text style={[styles.label, styles.blueText]}>Additional Info</Text>
      <Text style={styles.value}>: {item.formDataScnd.additionalInfo}</Text>
    </View>
  </View>
)}




        <View style={{ marginTop: 14 }} >


          <TouchableOpacity style={{ width: 300, height: 30, alignItems: "center", justifyContent: 'center', backgroundColor: '#228B22', borderRadius: 8, alignSelf: 'center', margin: 5 }} >

            <Text style={{ color: 'white' }}> Book now due {item.formDataScnd.bookingClosingD} </Text>
          </TouchableOpacity>



        </View>


      </View>
    
    </View>
    )





}
export default React.memo(ViewContractMoreInfo)
const styles = StyleSheet.create({
  buttonStyle: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    width: 150,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: "#6a0c0c",
    borderRadius: 3
  },
  buttonIsFalse: {
    borderWidth: 1,
    borderColor: '#6a0c0c',
    paddingLeft: 6,
    paddingRight: 6,
    alignSelf: 'center',

    marginLeft: 6
  },
  bttonIsTrue: {
    backgroundColor: '#6a0c0c',
    paddingLeft: 4,
    paddingRight: 4,
    color: 'white',
    alignSelf: 'center'

  },
  textRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 5,
    flexWrap: 'wrap',
    backgroundColor: '#f8f9fa',
  },
  smallCard: {
    backgroundColor: '#f8f9fa',
    marginBottom: 8, padding: 7, borderWidth: 0.6, borderColor: '#6a0c0c', borderRadius: 8, shadowColor: '#6a0c0c',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.7,
    shadowRadius: 5, overflow: 'hidden',
  },container: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
    elevation: 2,
  },
  contractHeader: {
    color: '#9c2828',
    fontWeight: 'bold',
    fontSize: 17,
    marginBottom: 12,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  label: {
    width: 120,
    fontWeight: '600',
    color: '#B22222',
  },
  value: {
    flex: 1,
    color: '#333',
  },
  greenText: {
    color: '#0B6623',
  },
  blueText: {
    color: '#00509E',
  },
});