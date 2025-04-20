

  // Reusable function to toggle local country
export function toggleLocalCountry(
  count: string, 
  setLocaOpLoc: React.Dispatch<React.SetStateAction<string>>, 
  setIntOpLoc: React.Dispatch<React.SetStateAction<string[]>>, 
  setDspAddLocation: React.Dispatch<React.SetStateAction<boolean>>, 
  setLocation: React.Dispatch<React.SetStateAction<string>>
): void {
  setIntOpLoc([]); // Clear international country selections
  setLocaOpLoc(count); // Set local country
  setDspAddLocation(false); // Hide location addition
  setLocation(''); // Reset the location string
}

// Reusable function to toggle international country
export function toggleInternationalCountry(
  country: string, 
  setLocaOpLoc: React.Dispatch<React.SetStateAction<string>>, 
  setIntOpLoc: React.Dispatch<React.SetStateAction<string[]>>
): void {
  setLocaOpLoc(''); // Clear local country
  setIntOpLoc((prev) => {
    if (prev.includes(country)) {
      return prev.filter(item => item !== country); // Remove if already selected
    } else {
      return [...prev, country]; // Add if not selected
    }
  });
}