import React from 'react';
import { View } from 'react-native';
import { ThemedText } from './ThemedText';
import { DropDownItem } from './DropDown';

interface LoadingDateSelectorProps {
  selectedDate: { id: number, name: string } | null;
  setSelectedDate: React.Dispatch<React.SetStateAction<{ id: number, name: string } | null>>;
}

export const LoadingDateSelector: React.FC<LoadingDateSelectorProps> = ({
  selectedDate,
  setSelectedDate
}) => {
  const getDateOptions = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(today.getDate() + 2);
    
    const nextDay = new Date(today);
    nextDay.setDate(today.getDate() + 3);
    
    const dayAfter = new Date(today);
    dayAfter.setDate(today.getDate() + 4);

    return [
      { id: 1, name: `Today (${today.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })})` },
      { id: 2, name: `Tomorrow (${tomorrow.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })})` },
      { id: 3, name: `Day After Tomorrow (${dayAfterTomorrow.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })})` },
      { id: 4, name: `${nextDay.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: '2-digit' })}` },
      { id: 5, name: `${dayAfter.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: '2-digit' })}` }
    ];
  };

  return (
    <View>
      <ThemedText>
        Loading Date<ThemedText color="red">*</ThemedText>
      </ThemedText>
      <DropDownItem
        allData={getDateOptions()}
        selectedItem={selectedDate}
        setSelectedItem={setSelectedDate}
        placeholder="Select Loading Date"
      />
    </View>
  );
};
