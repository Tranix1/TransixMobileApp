import { StyleSheet, Text, View } from 'react-native'
import React,{useEffect , useState} from 'react'
import { paginateDocuments } from '@/db/operations'
import { Contracts } from '@/types/types'
const Index = () => {

    // const [selectedTruckType, setSelectedTruckType] = useState<{ id: number, name: string, image: ImageSourcePropType | undefined } | null>(null)

    
    const [selectedCountry, setSelectedCountry] = useState('All')
    const [truckTonnage, setTruckTonnage] = useState("All")
    
    const [trucks, setTrucks] = useState<Contracts[] | null>(null)
    

    const LoadTructs = async () => {

        const maTrucks = await paginateDocuments("loadsContracts" ,"contractId");
        
        if (maTrucks) {

            setTrucks(maTrucks as Contracts[]);

        }

    }


    useEffect(() => {
        LoadTructs();
    }, [])

        console.log(trucks?.length)

    return (
        <View style={{paddingTop:100}} >
            <Text>Index</Text>
        </View>
    )
}

export default Index

const styles = StyleSheet.create({
    
})

