import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { decodePolyline, LatLng } from "@/Utilities/decodePolyline";

export default function Map() {
  const [routeCoords, setRouteCoords] = useState<LatLng[]>([]);

  const beiraCoords = { latitude: -19.8458, longitude: 34.8427 };
  const harareCoords = { latitude: -17.8252, longitude: 31.0335 };

  useEffect(() => {
    async function fetchRoute() {     

          const points: LatLng[] = decodePolyline("zccxByetsEq_@}EwVbSyPiB}nCefBitE_zCyxBb[krAhcA_j@l_D}v@hiCsbE|cFqg@~]{sAmGuz@wEu}@`w@woC~bCuiC`]_jEhpAie@`yCy`Bt{GsuAbbCskC|rBa}Cd{DsqAzmBuvC`fCsi@djAma@l]knAr_GgfBvoFe`CreEk{G~hJ_vGlfSkeBflE}xAv_BeyBz~Eq_@``CjFzeAq{@`cDujA|}GdSn`Cx|@rzCgbAjlGcpAdsDenC`mH_H~kBcr@hlByt@lwAoeCr_B{r@|k@onAhJoaC|f@cs@`a@i^hnAgVjcBnKfz@hI`aCgk@zl@whAdSyd@hlB__@`p@f^xv@brBnuBp|@jm@hB`w@d[pl@yFplAebBdlAmuBdiBo_@nxAfWfbA|qA~`C`jAxmAbq@zaBfSfxAfQtaAxi@hZnf@~sAiEd{A`b@pcA_Inx@{f@jOq[hm@_h@d~@\\`sBqo@zwA}aD`gHzK|lFwlA`rChDtgCavAlcDqA|mE{i@biDqWptEa_AtcCi{@d_Au[fnAixAfcGwlAv_Eil@nwEyhAvyFs{@~lDoqA|lG}s@zy@sKj_AsNl}ClvBpzCrwCnzGp_AzoBsJlfCvc@`pBleAviBjQfmDsNvrAm^rk@s_@pc@cHb`@y}@}i@iZuMoKrUik@~k@_s@lEscA|y@n@jz@gd@x_@|Ez_@oV_Ayb@bt@mc@pjAxd@zdDmo@zmEsKzjFf~@zuGeEnbBweAzxAg\\llCsl@`{Bq\\ziCm@pqBog@heD`JjjCkx@~aCeyApjB_~BfyAixGp}BkgBnjBitA~bBslA`c@glB|WirBMmwAa@aOfz@}O`}@yc@~RktCzXauEbLkPtQ{rDxqAo|CneAgqDzMiyAbDwn@fm@}}BtTu]kQypANcnD_d@gkC}\\c~@rJ_oAwYqbBae@qoBxDgmDnOeuChWwiE`zAeaBhyAcXv}@}lB`yHkkAz}CyyLzeJigCxrB_g@p_AeqBvqDePnvC\\hr@iQxnA`KtyAnnArsErrArzHnRpp@{LniAga@~r@zGraAze@vqA`D|dB~HdhCmA~iAra@hkAtyArnF~D|yC_m@xiCcFtoBmi@nsD}~@jsAmdApx@of@hbBe_BrwHo\\xeCiy@jzAadBpdA{tAjcCc_DpyB{gDv`AahF~p@wi@lNinCba@ecEj~AwcA~n@emApOcvBrgAk_CjgKupAbmBotBp`Jc[pp@qm@`{Cem@hn@ug@hcBv@nrBhLjx@oMbSb@`v@xNnaA" );
          setRouteCoords(points); // update state
     
    }

    fetchRoute();
  }, []);

  

  const getInitialRegion = () => {
    const allLatitudes = [beiraCoords.latitude, harareCoords.latitude];
    const allLongitudes = [beiraCoords.longitude, harareCoords.longitude];
    const minLat = Math.min(...allLatitudes);
    const maxLat = Math.max(...allLatitudes);
    const minLng = Math.min(...allLongitudes);
    const maxLng = Math.max(...allLongitudes);

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: (maxLat - minLat) * 1.5,
      longitudeDelta: (maxLng - minLng) * 1.5,
    };
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={getInitialRegion()} provider="google">
        <Marker coordinate={beiraCoords} title="Beira" />
        <Marker coordinate={harareCoords} title="Harare" />
        {routeCoords.length > 0 && (
          <Polyline coordinates={routeCoords} strokeColor="#007bff" strokeWidth={4} />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFillObject },
  map: { ...StyleSheet.absoluteFillObject },
});
