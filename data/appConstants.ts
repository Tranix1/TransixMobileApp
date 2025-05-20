
  export const truckTypes = [
    { id: 0, name: 'Flat deck', image: require('@/assets/images/Trucks/images (2).jpeg') },
    { id: 1, name: 'Bulk Trailer', image: require('@/assets/images/Trucks/download (1).jpeg') },
    { id: 2, name: 'Low Bed', image: require('@/assets/images/Trucks/H805f1f51529345648d1da9e5fcd6807e2.jpg') },
    { id: 3, name: 'Side Tipper', image: require('@/assets/images/Trucks/images (5).jpeg') },
    { id: 4, name: 'Tautliner', image: require('@/assets/images/Trucks/download (3).jpeg') },
    { id: 5, name: 'Tanker', image: require('@/assets/images/Trucks/images (7).jpeg') },
    { id: 6, name: 'Other', image: require('@/assets/images/Trucks/download (4).jpeg') },
    // { id: 7, name: 'All', image: '' },
  ]
  export const tankerTypes = [
        {
            id: 0,
            name: "Oil Tankers",
            description: "Carry oil or its products.",
            products: ["Crude oil", "Gasoline", "Diesel", "Jet fuel"]
        },
        {
            id: 1,
            name: "Chemical Tankers",
            description: "Transport various liquid chemicals in bulk.",
            products: ["Acids", "Vegetable oils", "Ethylene glycol", "Methanol"]
        },
        {
            id: 2,
            name: "Gas Carriers",
            description: "Transport liquefied gases at very low temperatures or under high pressure.",
            products: ["Liquefied Natural Gas (LNG)", "Liquefied Petroleum Gas (LPG)", "Propane", "Butane"]
        },
        {
            id: 3,
            name: "Food-Grade Tankers",
            description: "Transporting liquid food products.",
            products: ["Milk", "Juice", "Wine", "Edible oils"]
        },
        {
            id: 4,
            name: "Specialized Cargo ",
            description: "Tankers built for specific, unique liquid cargoes.",
            products: ["Bitumen", "Slurry", "Molten sulfur", "Hydrogen"]
        },
     {
            id: 5,
            name: "Other",
            description: "Tankers built for specific, unique liquid cargoes.",
            products: ["Bitumen", "Slurry", "Molten sulfur", "Hydrogen"]
        }
    ];

 export const trailerConfigurations = [
    { id: 0, name: "single Axle" },
    { id: 1, name: "tandem" },
    { id: 2, name: "triaxle"  },
    { id: 3, name: "MultiAxle" },
    { id: 4, name: 'Other' }
  ]
export  const truckSuspensions =[

    { id: 1, name: "Link" },
    { id: 2, name: "Super Link" },
    { id: 3, name: "Air suspension" },
    { id: 4, name: "mechanical steel"  },
    { id: 5, name: "Other"  },
  ]


export      const litresCapacity = [
    { id: 0, name: '300L'},
    { id: 1, name: '400L'},
    { id: 2, name: '500L'},
    { id: 3, name: '700L'},
    { id: 4, name: '800L' },
    { id: 5, name: '900L'},
    ]

  export  const tonneSizes = [
    { id: 0, name: '1-3 T' },
    { id: 1, name: '3-6 T' },
    { id: 2, name: '7-10 T'},
    { id: 3, name: '11-13 T'},
    { id: 4, name: '12-15 T'},
    { id: 5, name: '16-20 T'},
    { id: 6, name: '20T++'},
    ];


 export const countryCodes = [
    { id: 0, name: '+263' },
    { id: 1, name: '+27' },
    { id: 2, name: '+243' }
  ]
